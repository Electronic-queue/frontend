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

const WaitingPage = () => {
    const { data, error } = useGetRecordIdByTokenQuery();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        startSignalR();

        const handleNewNotification = (
            recordId: number,
            windowId: number,
            clientNumber: number,
            expectedAcceptanceString: string
        ) => {
            setNotifications((prev) => [
                ...prev,
                {
                    recordId,
                    windowId,
                    clientNumber,
                    expectedAcceptanceString,
                },
            ]);
        };

        connection.on("ReceiveRecordCreated", handleNewNotification);

        return () => {
            connection.off("ReceiveRecordCreated", handleNewNotification);
        };
    }, []);

    const handleModalOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    const handleConfirmRefuse = () => setIsOpen(false);

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
                        {t("i18n_queue.number")} {data?.recordId}
                    </Typography>
                </Box>

                <InfoBlock>
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
                                        {t("i18n_queue.window")}:
                                        {notif.windowId}
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
                title={t("i18n_queue.refuseQueue")}
                width={450}
            >
                <Box display="flex" gap={2} justifyContent="center">
                    <CustomButton
                        variantType="primary"
                        onClick={handleConfirmRefuse}
                    >
                        {t("i18n_queue.confirm")}
                    </CustomButton>
                    <CustomButton variantType="danger" onClick={handleClose}>
                        {t("i18n_queue.cancel")}
                    </CustomButton>
                </Box>
            </ReusableModal>
        </BackgroundContainer>
    );
};

export default WaitingPage;
