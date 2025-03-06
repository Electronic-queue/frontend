import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import theme from "src/styles/theme";
import { TimerProps } from "../types/timerTypes";
import CustomButton from "src/components/Button";
import { Alert, Snackbar } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useStartWindowMutation } from "src/store/managerApi";

const Timer: React.FC<TimerProps> = ({
    initialTime,
    onResume,
    managerId = 6,
}) => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState(initialTime * 60);
    const [isCountingUp, setIsCountingUp] = useState(false);
    const [startWindow] = useStartWindowMutation();
    const [snackbar, setSnackbar] = useState({ open: false, message: "" });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === 0 && !isCountingUp) {
                    setIsCountingUp(true);
                    return 1;
                }
                return isCountingUp ? prev + 1 : prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isCountingUp]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");
        const secs = (seconds % 60).toString().padStart(2, "0");
        return `${mins}:${secs}`;
    };

    const totalTime = initialTime * 60;
    const progress = isCountingUp ? 100 : (timeLeft / totalTime) * 100;
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const handleStartWindow = async () => {
        try {
            await startWindow({ managerId }).unwrap();
            setSnackbar({ open: true, message: t("i18n_queue.windowStarted") });
        } catch (error) {
            console.error(error);
            setSnackbar({ open: true, message: t("i18n_queue.startError") });
        }
    };

    const handleButtonClick = () => {
        onResume();
        handleStartWindow();
    };

    return (
        <>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ open: false, message: "" })}
            >
                <Alert
                    severity="success"
                    onClose={() => setSnackbar({ open: false, message: "" })}
                    sx={{ fontSize: theme.typography.body1.fontSize }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
            <Box textAlign="center">
                <Box
                    component="svg"
                    width={180}
                    height={180}
                    sx={{ transform: "rotate(90deg)", margin: "0 auto" }}
                >
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke={theme.palette.error.main}
                        strokeWidth="8"
                    />
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke={theme.palette.green.main}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 1s linear" }}
                    />
                </Box>

                <Typography
                    variant="body2"
                    sx={{
                        color: isCountingUp
                            ? theme.palette.error.main
                            : theme.palette.green.main,
                        marginTop: "-120px",
                        marginRight: "20px",
                    }}
                >
                    {formatTime(timeLeft)}
                </Typography>

                <CustomButton
                    onClick={handleButtonClick}
                    variantType="primary"
                    sizeType="medium"
                    sx={{ mt: 8 }}
                >
                    {t("i18n_queue.resumeWork")}
                </CustomButton>
            </Box>
        </>
    );
};

export default Timer;
