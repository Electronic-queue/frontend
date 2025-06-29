import { useEffect, useReducer, useCallback, useState } from "react";
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
    useGetTicketNumberByTokenQuery,
} from "src/store/userApi";
import connection, { startSignalR } from "src/features/signalR";
import { useDispatch, useSelector } from "react-redux";
import {
    setToken,
    setRecordId,
    setTicketNumber,
} from "src/store/userAuthSlice";
import { useNavigate } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import { RootState } from "src/store/store";
import i18n from "src/i18n";

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
    gap: theme.spacing(2),
}));

interface RefuseModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}
interface ClientRecord {
    recordId: number;
    windowNumber: number;
    nameRu: string;
    nameKk: string;
    nameEn: string;
    clientNumber: number;
    expectedAcceptanceTime: string;
    ticketNumber: number;
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
    const recordId = useSelector((state: RootState) => state.user.recordId);
    const { data: ticketData } = useGetTicketNumberByTokenQuery(undefined);
    const wasRedirected = useSelector(
        (state: RootState) => state.user.wasRedirected
    );
    const cabinetNameRu = useSelector((state: RootState) => state.user.nameRu);
    const cabinetNameKk = useSelector((state: RootState) => state.user.nameKk);
    const cabinetNameEn = useSelector((state: RootState) => state.user.nameEn);
    const ticketNumber = useSelector(
        (state: RootState) => state.user.ticketNumber
    );

    useEffect(() => {
        if (
            ticketData?.ticketNumber &&
            ticketData.ticketNumber !== ticketNumber
        ) {
            dispatch(setTicketNumber(ticketData.ticketNumber));
        }
    }, [ticketData, ticketNumber, dispatch]);

    const [recordData, setRecordData] = useState<ClientRecord | null>(null);

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

    useEffect(() => {}, [clientRecord]);
    useEffect(() => {
        if (recordId) {
            refetch();
        }
    }, [recordId, refetch]);

    useEffect(() => {}, [recordId]);
    useEffect(() => {
        if (clientRecord) {
            setRecordData(clientRecord);
        }
    }, [clientRecord]);

    useEffect(() => {
        if (recordId) {
            refetch();
        }
    }, [recordId, refetch]);

    const [updateQueueItem, { isLoading: isUpdating }] =
        useUpdateQueueItemMutation();
    const [isOpen, toggleModal] = useReducer((open) => !open, false);

    useEffect(() => {
        if (tokenData?.recordId && tokenData.recordId !== recordId) {
            dispatch(setRecordId(tokenData.recordId));
        }
    }, [tokenData, recordId, dispatch]);

    useEffect(() => {
        startSignalR();

        connection.on("ReceiveRecordCreated", (newRecord) => {
            if (newRecord.ticketNumber === ticketNumber) {
                if (newRecord.clientNumber === -1) {
                    navigate("/call", { replace: true });
                }
            }
        });

        connection.on("RecieveUpdateRecord", (queueList) => {
            const latestRecord = queueList.find(
                (item: { ticketNumber: number }) =>
                    item.ticketNumber === ticketNumber
            );

            if (latestRecord) {
                setRecordData(latestRecord);
                refetch();
                if (latestRecord.clientNumber === -6) {
                    navigate("/rejected", { replace: true });
                }
                if (latestRecord.clientNumber === -1) {
                    navigate("/call", { replace: true });
                }
            }
        });

        return () => {
            connection.off("ReceiveRecordCreated");
            connection.off("ReceiveUpdateRecord");
        };
    }, [ticketNumber, navigate]);

    const handleConfirmRefuse = useCallback(async () => {
        if (!recordId) return;
        try {
            await updateQueueItem({ id: recordId }).unwrap();
        } catch (error) {
            console.error("Ошибка при обновлении очереди:", error);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("recordId");
        localStorage.removeItem("ticketNumber");
        dispatch(setTicketNumber(null));
        await refetch();
        dispatch(setToken(null));
        dispatch(setRecordId(null));
        connection.off("ReceiveRecordCreated");
        connection.off("ReceiveUpdateRecord");
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

    const displayedName =
        i18n.language === "kz"
            ? wasRedirected
                ? cabinetNameKk
                : recordData?.nameKk
            : i18n.language === "en"
              ? wasRedirected
                  ? cabinetNameEn
                  : recordData?.nameEn
              : wasRedirected
                ? cabinetNameRu
                : recordData?.nameRu;

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
                        {t("i18n_queue.number")}{" "}
                        {ticketNumber ? `${ticketNumber}` : ""}
                    </Typography>
                </Box>

                <InfoBlock>
                    {recordData ? (
                        <>
                            <Typography variant="h6">
                                {displayedName?.trim() ? displayedName : "—"}
                            </Typography>

                            <Typography variant="h6">
                                {t("i18n_queue.window")}:{" "}
                                {recordData.windowNumber ?? "—"}
                            </Typography>
                            <Typography variant="h6">
                                {t("i18n_queue.peopleAhead")}:{" "}
                                {recordData.clientNumber ?? "—"}
                            </Typography>
                            <Typography variant="h6">
                                {t("i18n_queue.expectedTime")}:{" "}
                                {recordData.expectedAcceptanceTime ?? "—"}
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
