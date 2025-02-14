import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { SULogoM } from "src/assets";
import theme from "src/styles/theme";
import CustomButton from "src/components/Button";
import ReusableModal from "src/components/ModalPage";
import {
    useGetRecordIdByTokenQuery,
    useGetClientRecordByIdQuery,
} from "src/store/managerApi";
import connection, { startSignalR } from "src/features/signalR";
import { useDispatch } from "react-redux";
import { setToken } from "src/store/userAuthSlice";
import { useNavigate } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";

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

const RefuceModal = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    alignItems: "center",
    justifyContent: "center",
}));

interface ClientRecord {
    recordId: number;
    windowNumber: number;
    clientNumber: string;
    expectedAcceptanceTime: string;
}

const WaitingPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        data: tokenData,
        refetch: refetchRecordId,
        isFetching: isFetchingRecordId,
    } = useGetRecordIdByTokenQuery();
    const recordId = tokenData?.recordId;

    const { data: clientRecord } = useGetClientRecordByIdQuery(recordId ?? 0, {
        skip: !recordId,
    });

    const [recordData, setRecordData] = useState<ClientRecord | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        refetchRecordId();
    }, []);

    useEffect(() => {
        if (clientRecord && clientRecord.recordId !== recordData?.recordId) {
            setRecordData(clientRecord);
            console.log("Client Record Data:", clientRecord);
        }
    }, [clientRecord, recordData]);

    useEffect(() => {
        startSignalR();

        connection.on("ReceiveRecordCreated", (newRecord: ClientRecord) => {
            console.log("ReceiveRecordCreated:", newRecord);
            if (newRecord.recordId === recordId) {
                setRecordData(newRecord);
                console.log("New Record Created:", newRecord);
            }
        });

        connection.on("RecieveUpdateRecord", (queueList) => {
            console.log("ReceiveUpdateRecord:", queueList);
            if (!recordId) return;
            const updatedItem = queueList.find(
                (item: { recordId: number }) => item.recordId === recordId
            );
            if (updatedItem) {
                setRecordData(updatedItem);
                console.log("Updated Record:", updatedItem);
            }
        });

        return () => {
            connection.off("ReceiveRecordCreated");
            connection.off("ReceiveUpdateRecord");
            console.log("SignalR connection cleaned up.");
        };
    }, [recordId]);

    const handleModalOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    const handleConfirmRefuse = () => {
        localStorage.removeItem("token");
        dispatch(setToken(null));
        navigate("/");
        setIsOpen(false);
    };

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
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{ marginBottom: 2 }}
                    >
                        {t("i18n_queue.number")} {recordData?.recordId || "-"}
                    </Typography>
                </Box>

                <InfoBlock>
                    {recordData ? (
                        <>
                            <Typography variant="h6">
                                {t("i18n_queue.window")}:
                                {recordData.windowNumber}
                            </Typography>
                            <Typography variant="h6">
                                {t("i18n_queue.peopleAhead")}:
                                {recordData.clientNumber}
                            </Typography>
                            <Typography variant="h6">
                                {t("i18n_queue.expectedTime")}:
                                {recordData.expectedAcceptanceTime}
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
                        onClick={handleModalOpen}
                    >
                        {t("i18n_queue.refuse")}
                    </CustomButton>
                </Box>
            </FormContainer>
            <ReusableModal
                open={isOpen}
                onClose={handleClose}
                width={340}
                showCloseButton={false}
            >
                <RefuceModal>
                    <Box>
                        <Typography variant="h4">
                            {t("i18n_queue.refuseQueue")}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: theme.spacing(2) }}>
                        <CustomButton
                            variantType="primary"
                            onClick={handleConfirmRefuse}
                        >
                            {t("i18n_queue.confirm")}
                        </CustomButton>
                        <CustomButton
                            variantType="primary"
                            onClick={handleClose}
                        >
                            {t("i18n_queue.cancel")}
                        </CustomButton>
                    </Box>
                </RefuceModal>
            </ReusableModal>
        </BackgroundContainer>
    );
};

export default WaitingPage;
