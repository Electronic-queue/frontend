// src/features/pages/InProgress.tsx
import { useEffect, useRef } from "react";
import { Typography } from "@mui/material";
import Stack from "@mui/material/Stack";
// 1. Добавляем useTheme
import { styled, useTheme } from "@mui/material/styles"; 
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
// 2. Импортируем темный логотип
import { SULogoM, SULogoMDark } from "src/assets";

// УДАЛЕНО: import theme from "src/styles/theme"; 
import { useNavigate } from "react-router-dom";
import connection, { startSignalR } from "src/features/signalR";
import { useGetRecordIdByTokenQuery } from "src/store/userApi";
import { useSelector } from "react-redux";
import { RootState } from "src/store/store";
import { useRegisterClientMutation } from "src/store/signalRClientApi";

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

const InProgress = () => {
    const theme = useTheme();
    
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    const { data: recordData, isLoading: isRecordLoading } = useGetRecordIdByTokenQuery();
    
    const ticketNumber = useSelector((state: RootState) => state.user.ticketNumber);
    
    const [registerClient] = useRegisterClientMutation();
    const hasRegistered = useRef(false);

    useEffect(() => {
        if (isRecordLoading || !recordData) return;

        let isMounted = true;

        const initSignalR = async () => {
            if (hasRegistered.current) return;

            try {
                let connectionId = await startSignalR();

                if (!connectionId && connection.state === "Connected") {
                    connectionId = connection.connectionId;
                }

                if (connectionId && isMounted) {
                    
                    await registerClient({
                        connectionId: connectionId,
                    }).unwrap();

                    hasRegistered.current = true;
                }
            } catch (err) {
                console.error("❌ SignalR Registration Error:", err);
            }
        };

        initSignalR();

        connection.on("RecordCompleted", (data) => {
            navigate("/rating", { replace: true });
        });

        return () => {
            isMounted = false;
            connection.off("RecordCompleted");
        };
    }, [navigate, recordData, isRecordLoading, registerClient]);

    return (
        <BackgroundContainer>
            <Box sx={{ paddingBottom: theme.spacing(5) }}>
                {/* 4. Логика смены логотипа */}
                {theme.palette.mode === 'dark' ? <SULogoMDark /> : <SULogoM />}
            </Box>
            <FormContainer>
                 {ticketNumber && (
                    <Typography variant="h3" sx={{ mb: 2 }}>
                      Ваш номер  {ticketNumber}
                    </Typography>
                )}
                <Typography sx={{ fontSize: theme.typography.h5.fontSize }}>
                    {t("i18n_queue.beingServed")}
                </Typography>
            </FormContainer>
        </BackgroundContainer>
    );
};

export default InProgress;