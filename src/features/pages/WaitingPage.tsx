import { useEffect, useReducer, useCallback } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { SULogoM } from "src/assets";
import theme from "src/styles/theme";
import CustomButton from "src/components/Button";
import ReusableModal from "src/components/ModalPage";

import {
    useGetClientRecordByIdQuery,
    useGetRecordIdByTokenQuery,
    useUpdateQueueItemMutation,
} from "src/store/userApi";
import connection, { startSignalR } from "src/features/signalR";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setRecordId } from "src/store/userAuthSlice";
import { useNavigate } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import { RootState } from "src/store/store";

const BackgroundContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(5),
}));

const FormContainer = styled(Box)(({ theme }) => ({
    width: "100%",
    maxWidth: theme.spacing(50),
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[2],
}));

const InfoBlock = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
}));

interface RefuseModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const RefuseModal = ({ open, onClose, onConfirm }: RefuseModalProps) => {
    const { t } = useTranslation();
    return (
        <ReusableModal
            open={open}
            onClose={onClose}
            width={340}
            showCloseButton={false}
        >
            <Box
                display="flex"
                flexDirection="column"
                gap={2}
                alignItems="center"
            >
                <Typography variant="h4">
                    {t("i18n_queue.refuseQueue")}
                </Typography>
                <Box sx={{ display: "flex", gap: theme.spacing(2) }}>
                    <CustomButton variantType="primary" onClick={onConfirm}>
                        {t("i18n_queue.confirm")}
                    </CustomButton>
                    <CustomButton variantType="primary" onClick={onClose}>
                        {t("i18n_queue.cancel")}
                    </CustomButton>
                </Box>
            </Box>
        </ReusableModal>
    );
};

const WaitingPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const recordId = useSelector(
        (state: RootState) => (state.user as any).recordId
    );

    const {
        data: tokenData,
        isFetching: isFetchingRecordId,
        refetch,
    } = useGetRecordIdByTokenQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    const { data: clientRecord } = useGetClientRecordByIdQuery(recordId ?? 0, {
        skip: !recordId,
    });
    useEffect(() => {}, [recordId]);

    useEffect(() => {
        if (recordId) {
            refetch();
        }
    }, [recordId, refetch]);

    const [updateQueueItem, { isLoading: isUpdating }] =
        useUpdateQueueItemMutation();
    const [isOpen, toggleModal] = useReducer((open) => !open, false);

    useEffect(() => {
        if (
            tokenData &&
            typeof tokenData.recordId === "number" &&
            tokenData.recordId > 0 &&
            tokenData.recordId !== recordId &&
            tokenData.recordId > (recordId ?? 0)
        ) {
            dispatch(setRecordId(tokenData.recordId));
        }
    }, [tokenData, recordId, dispatch]);

    useEffect(() => {
        startSignalR();

        connection.on("ReceiveRecordCreated", (newRecord) => {
            if (newRecord.recordId === recordId) {
                if (newRecord.clientNumber === -1) {
                    navigate("/call");
                }
            }
        });

        connection.on("RecieveUpdateRecord", (queueList) => {
            const latestRecord = queueList.find(
                (item: { recordId: number }) => item.recordId === recordId
            );


            if (latestRecord) {
                dispatch(setRecordId(latestRecord.recordId));

                if (latestRecord.clientNumber === -1) {
                    navigate("/call");
                }

            }
        });

        return () => {
            connection.off("ReceiveRecordCreated");
            connection.off("ReceiveUpdateRecord");
            connection.off("SendToClients");
        };
    }, [recordId, navigate]);

    const handleConfirmRefuse = useCallback(async () => {
        if (!recordId) return;
        try {
            await updateQueueItem({ id: recordId }).unwrap();
        } catch (error) {
            console.error("Ошибка при обновлении очереди:", error);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("recordId");
        await refetch();
        dispatch(setToken(null));
        connection.off("ReceiveRecordCreated");
        connection.off("ReceiveUpdateRecord");
        dispatch(setRecordId(null));
        navigate("/");
    }, [recordId, dispatch, navigate, updateQueueItem]);

    if (isFetchingRecordId) {
        return (
            <BackgroundContainer>
                <Skeleton variant="rectangular" width={350} height={430} />
            </BackgroundContainer>
        );
    }

    if (!recordId) {
        return (
            <BackgroundContainer>
                <Typography variant="h6">
                    {t("i18n_queue.noNotifications")}
                </Typography>
            </BackgroundContainer>
        );
    }

    return (
        <BackgroundContainer>
            <Box sx={{ paddingBottom: theme.spacing(5) }}>
                <SULogoM />
            </Box>
            <FormContainer>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: theme.spacing(4),
                    }}
                >
                    <Typography variant="h4">
                        {t("i18n_queue.number")} {clientRecord?.recordId || "-"}
                    </Typography>
                </Box>

                <InfoBlock>
                    {clientRecord ? (
                        <>
                            <Typography variant="h6">
                                {t("i18n_queue.window")}:{" "}
                                {clientRecord.windowNumber}
                            </Typography>
                            <Typography variant="h6">
                                {t("i18n_queue.peopleAhead")}:{" "}
                                {clientRecord.clientNumber}
                            </Typography>
                            <Typography variant="h6">
                                {t("i18n_queue.expectedTime")}:{" "}
                                {clientRecord.expectedAcceptanceTime}
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Skeleton
                                variant="rectangular"
                                width="100%"
                                height={30}
                            />
                            <Skeleton
                                variant="rectangular"
                                width="100%"
                                height={30}
                            />
                            <Skeleton
                                variant="rectangular"
                                width="100%"
                                height={30}
                            />
                        </>
                    )}
                </InfoBlock>

                <Box sx={{ paddingTop: theme.spacing(5) }}>
                    <CustomButton
                        variantType="danger"
                        fullWidth
                        onClick={toggleModal}
                        disabled={isUpdating}
                    >
                        {t("i18n_queue.refuse")}
                    </CustomButton>
                </Box>
            </FormContainer>
            <RefuseModal
                open={isOpen}
                onClose={toggleModal}
                onConfirm={handleConfirmRefuse}
            />
        </BackgroundContainer>
    );
};

export default WaitingPage;
