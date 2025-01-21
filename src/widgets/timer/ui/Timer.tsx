import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import theme from "src/styles/theme";
import { TimerProps } from "../types/timerTypes";
import CustomButton from "src/components/Button";

const Timer: React.FC<TimerProps> = ({ initialTime, onResume }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime * 60);
    const [isCountingUp, setIsCountingUp] = useState(false);

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

    return (
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
                onClick={onResume}
                variantType="primary"
                sizeType="medium"
                sx={{ mt: 8 }}
            >
                Вернуться на работу
            </CustomButton>
        </Box>
    );
};

export default Timer;
