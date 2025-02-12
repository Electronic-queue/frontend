import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { SULogoM } from "src/assets";
import theme from "src/styles/theme";
import CustomButton from "src/components/Button";
import ReusableModal from "src/components/ModalPage";
import { useGetRecordIdByTokenQuery } from "src/store/managerApi";
import connection, { startSignalR } from "src/features/signalR";
import { useDispatch } from "react-redux";
import { setToken } from "src/store/userAuthSlice";
import { useNavigate } from "react-router-dom";

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

const WaitingPage = () => {
    const { data, refetch, isFetching } = useGetRecordIdByTokenQuery();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        refetch();
    }, []);

    useEffect(() => {
        startSignalR();
        const handleNewNotification = (
            recordId: number,
            windowId: number,
            clientNumber: number,
            expectedAcceptanceString: string
        ) => {
            setNotifications((prev) => {
                if (recordId === data?.recordId) {
                    return [
                        {
                            recordId,
                            windowId,
                            clientNumber,
                            expectedAcceptanceString,
                        },
                    ];
                }
                return prev;
            });
        };

        connection.on("ReceiveRecordCreated", handleNewNotification);

        return () => {
            connection.off("ReceiveRecordCreated", handleNewNotification);
        };
    }, [data?.recordId]);
    const dispatch = useDispatch();
    const handleModalOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    const handleConfirmRefuse = () => {
        localStorage.removeItem("token");
        dispatch(setToken(null));
        navigate("/");
        setIsOpen(false);
    };

    if (isFetching) {
        return (
            <BackgroundContainer>
                <Typography variant="h6">{t("i18n_queue.loading")}</Typography>
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
                        {t("i18n_queue.number")} {data?.recordId || "-"}
                    </Typography>
                </Box>

                <InfoBlock>
                    {notifications.length === 0 ? (
                        <Typography variant="h6" color="textSecondary">
                            {t("i18n_queue.noNotifications")}
                        </Typography>
                    ) : (
                        notifications.map((notif, index) => (
                            <Box
                                key={index}
                                display="flex"
                                flexDirection="column"
                                gap={1}
                            >
                                <Typography variant="h5">
                                    {t("i18n_queue.window")}: {notif.windowId}
                                </Typography>
                                <Typography variant="h5">
                                    {t("i18n_queue.clientNumber")}:
                                    {notif.clientNumber}
                                </Typography>
                                <Typography variant="h5">
                                    {t("i18n_queue.expectedTime")}:
                                    {notif.expectedAcceptanceString}
                                </Typography>
                            </Box>
                        ))
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
