import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import { SULogoM } from "src/assets";
import CustomButton from "src/components/Button";
import mockData from "src/components/mock/MockWaitingData.json";
import theme from "src/styles/theme";
import { useNavigate } from "react-router-dom";
import connection, { startSignalR } from "src/features/signalR";
import { useGetRecordIdByTokenQuery } from "src/store/managerApi";

const BackgroundContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(5),
}));

const FormContainer = styled(Stack)(({ theme }) => ({
    width: "100%",
    maxWidth: theme.spacing(50),
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[2],
    textAlign: "center",
}));

const TitleBox = styled(Box)(({ theme }) => ({
    width: theme.spacing(15),
    height: theme.spacing(15),
    borderRadius: "50%",
    border: `8px solid ${theme.palette.error.main}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
            <TitleBox>
                <Typography
                    variant="h1"
                    sx={{ color: theme.palette.error.main }}
                >
                    {timeLeft}
                </Typography>
            </TitleBox>
        </BackgroundContainer>
    );
};

const CallPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [expired, setExpired] = useState(false);
    const windowNumber = mockData.mock[0].window;

    const { data: recordData, isLoading: isRecordLoading } =
        useGetRecordIdByTokenQuery();

    useEffect(() => {
        if (isRecordLoading) return;

        startSignalR();

        connection.on("ReceiveRecordCreated", (newRecord) => {
            if (
                newRecord.recordId === recordData?.recordId &&
                newRecord.clientNumber === -1
            ) {
                navigate("/progress");
            }
        });

        connection.on("RecieveUpdateRecord", (queueList) => {
            const updatedItem = queueList.find(
                (item: { recordId: number }) =>
                    item.recordId === recordData?.recordId
            );
            if (updatedItem && updatedItem.clientNumber === -1) {
                navigate("/progress");
            }
        });

        connection.on("RecieveAcceptRecord", (recordAccept) => {
            if (recordAccept.recordId === recordData?.recordId) {
                navigate("/progress");
            }
        });

        return () => {
            connection.off("ReceiveRecordCreated");
            connection.off("RecieveUpdateRecord");
            connection.off("RecieveAcceptRecord");
        };
    }, [navigate, recordData, isRecordLoading]);

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
