import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { Box, Stack, styled } from "@mui/system";
import { useTranslation } from "react-i18next";
import { SULogoM } from "src/assets";
import CustomButton from "src/components/Button";
import theme from "src/styles/theme";
import mockData from "src/components/mock/MockWaitingData.json";

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
    textAlign: "center",
}));

interface TimerProps {
    onTimeout: () => void;
}

const Timer: React.FC<TimerProps> = ({ onTimeout }) => {
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        if (timeLeft === 0) {
            onTimeout();
            return;
        }
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, onTimeout]);

    return (
        <BackgroundContainer>
            <Box
                sx={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    border: `8px solid ${theme.palette.error.main}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "60px auto",
                }}
            >
                <Typography
                    variant="h1"
                    sx={{ color: theme.palette.error.main }}
                >
                    {timeLeft}
                </Typography>
            </Box>
        </BackgroundContainer>
    );
};

const CallPage = () => {
    const { t } = useTranslation();
    const [expired, setExpired] = useState(false);
    const windowNumber = mockData.mock[0].window;

    return (
        <BackgroundContainer>
            <Box sx={{ paddingBottom: theme.spacing(5) }}>
                <SULogoM />
            </Box>
            <FormContainer>
                {!expired ? (
                    <>
                        <Typography variant="h4" sx={{ marginBottom: 2 }}>
                            {t("i18n_queue.approachWindow")} {windowNumber}
                        </Typography>
                        <Timer onTimeout={() => setExpired(true)} />
                        <Box sx={{ paddingTop: theme.spacing(5) }}>
                            <CustomButton
                                variantType="danger"
                                color="primary"
                                fullWidth
                            >
                                {t("i18n_queue.refuse")}
                            </CustomButton>
                        </Box>
                    </>
                ) : (
                    <Typography
                        variant="h5"
                        sx={{ color: theme.palette.error.main }}
                    >
                        {t("i18n_queue.timeoutMessage")}
                    </Typography>
                )}
            </FormContainer>
        </BackgroundContainer>
    );
};

export default CallPage;
