import { Typography } from "@mui/material";
import { Box, Stack, styled } from "@mui/system";
import { useTranslation } from "react-i18next";
import { SULogoM } from "src/assets";
import theme from "src/styles/theme";
import mockData from "src/components/mock/MockWaitingData.json";
import CustomButton from "src/components/Button";
import ReusableModal from "src/components/ModalPage";
import { useState } from "react";

const BackgroundContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.background.default,
    paddingTop: "34px",
}));

const FormContainer = styled(Stack)(({ theme }) => ({
    width: "100%",
    maxWidth: theme.spacing(50),
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    boxShadow: "2px 4px 10px rgba(0, 0, 0, 0.25)",
}));

const InfoBlock = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
}));

const WaitingPage = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const handleModalOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    const numberInLine = mockData.mock[0].numberInLine;
    const peopleAhead = mockData.mock[0].peopleAhead;
    const expectedTime = mockData.mock[0].expectedTime;
    const windowNumber = mockData.mock[0].window;
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
                        {t("i18n_queue.number")} {numberInLine}
                    </Typography>
                </Box>
                <InfoBlock>
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="h5">
                            {t("i18n_queue.window")}
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                            {windowNumber}
                        </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="h5">
                            {t("i18n_queue.peopleAhead")}
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                            {peopleAhead}
                        </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="h5">
                            {t("i18n_queue.ExpectedTime")}
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                            {expectedTime}
                        </Typography>
                    </Box>
                </InfoBlock>
                <Box sx={{ paddingTop: theme.spacing(5) }}>
                    <CustomButton
                        variantType="danger"
                        type="submit"
                        color="primary"
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
                title="Отказаться от очереди?"
                width={450}
                showCloseButton={false}
            >
                <Box display={"flex"} gap={2} justifyContent="center">
                    <CustomButton variantType="primary" onClick={handleClose}>
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
