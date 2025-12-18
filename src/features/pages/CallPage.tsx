// src/features/pages/CallPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { Typography } from "@mui/material";
import Stack from "@mui/material/Stack";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import { SULogoM, SULogoMDark } from "src/assets";
import CustomButton from "src/components/Button";
import ReusableModal from "src/components/ModalPage";
import { useNavigate } from "react-router-dom";
import connection, { startSignalR } from "src/features/signalR";
import {
    useGetClientRecordByIdQuery,
    useGetRecordIdByTokenQuery,
    useUpdateQueueItemMutation,
    useGetTicketNumberByTokenQuery,
} from "src/store/userApi";
import { useDispatch, useSelector } from "react-redux";
import {
    setRecordId,
    setTicketNumber,
    setToken,
    setNames,
    setWasRedirected,
} from "src/store/userAuthSlice";
import { RootState } from "src/store/store";
import { useRegisterClientMutation } from "src/store/signalRClientApi";
import i18n from "src/i18n"; // Импорт i18n для определения языка

const BackgroundContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(5),
}));

const FormContainer = styled(Stack)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
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

const RefuseModalBox = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    alignItems: "center",
    justifyContent: "center",
}));

interface TimerProps {
    onTimeout: () => void;
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

const Timer: React.FC<TimerProps> = ({ onTimeout }) => {
    const [timeLeft, setTimeLeft] = useState(90);

    useEffect(() => {
        if (timeLeft === 0) {
            onTimeout();
            return;
        }
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, onTimeout]);

    return (
        <FormContainer>
            <TitleBox>
                <Typography variant="h1" sx={{ color: "error.main" }}>
                    {timeLeft}
                </Typography>
            </TitleBox>
        </FormContainer>
    );
};

const CallPage = () => {
    const theme = useTheme();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [expired, setExpired] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    
    // --- Refs ---
    const hasRegistered = useRef(false);
    const hasAnnounced = useRef(false); // Ref для предотвращения повторной озвучки

    const [storedRecordId, setStoredRecordId] = useState<number | null>(() => {
        const savedRecordId = localStorage.getItem("recordId");
        return savedRecordId ? Number(savedRecordId) : null;
    });
    const { data: tokenData } = useGetRecordIdByTokenQuery();
    const recordId = tokenData?.recordId ? Number(tokenData.recordId) : null;
    const [updateQueueItem] = useUpdateQueueItemMutation();
    const { data: ticketNumber } = useGetTicketNumberByTokenQuery(undefined);
    const [recordData, setRecordData] = useState<ClientRecord | null>(null);
    const storedTicketNumber = useSelector(
        (state: RootState) => state.user.ticketNumber
    );
    const { data: clientRecord } = useGetClientRecordByIdQuery(recordId ?? 0, {
        skip: !recordId,
    });
    const [registerClient] = useRegisterClientMutation();
    
    const roomName = clientRecord?.nameRu;
    const windowNumber = clientRecord?.windowNumber ?? "-";

    // --- ФУНКЦИЯ ОЗВУЧКИ ---
    const speakCall = (windowNum: number | string) => {
        if (!windowNum || windowNum === "-") return;

        window.speechSynthesis.cancel(); // Сброс очереди

        const lang = i18n.language;
        let text = "";
        let voiceLang = "ru-RU";

        if (lang === 'kz' || lang === 'kk') {
            text = `Сізді ${windowNum} терезеге шақырады`;
            voiceLang = "kk-KZ";
        } else if (lang === 'en') {
            text = `You are called to window ${windowNum}`;
            voiceLang = "en-US";
        } else {
            text = `Вас вызывают к окну номер ${windowNum}`;
            voiceLang = "ru-RU";
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = voiceLang;
        utterance.rate = 1; 
        
        window.speechSynthesis.speak(utterance);
    };
    // ------------------------

    useEffect(() => {}, [storedRecordId]);

    useEffect(() => {
        if (clientRecord) {
            setRecordData(clientRecord);
            
            // Запускаем озвучку, когда данные загрузились и если еще не озвучивали
            if (clientRecord.windowNumber && !hasAnnounced.current) {
                // Небольшая задержка, чтобы пользователь успел понять, что произошло
                setTimeout(() => {
                    speakCall(clientRecord.windowNumber);
                }, 500);
                hasAnnounced.current = true;
            }
        }
    }, [clientRecord]);

    useEffect(() => {
        if (!recordId) return;

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
                        connectionId: connectionId
                    }).unwrap();

                    hasRegistered.current = true;
                }
            } catch (err) {
                console.error("❌ SignalR Registration Error:", err);
            }
        };

        initSignalR();
        connection.on("RecordAccepted", (RecordAcceptedData) => {
            navigate("/progress", { replace: true });
        });
        connection.on("RecordRedirected", (RecordRedirectedData) => {
            console.log("RecordRedirected", RecordRedirectedData);
        });
        connection.on("ReceiveRecordCreated", (newRecord) => {
            if (
                newRecord.ticketNumber === ticketNumber &&
                newRecord.clientNumber === -2
            ) {
                navigate("/progress");
            }
        });
        connection.on("RecieveUpdateRecord", (queueList) => {
            if (Array.isArray(queueList)) {
                const updatedItem = queueList.find(
                    (item: { ticketNumber: number | null }) =>
                        item.ticketNumber === storedTicketNumber
                );
                if (updatedItem && updatedItem.clientNumber === -2) {
                    navigate("/progress");
                }
            } else {
                if (queueList.ticketNumber === storedTicketNumber) {
                    navigate("/progress");
                }
            }
        });

        connection.on("RecieveRedirectClient", (data) => {
            if (data.ticketNumber === storedTicketNumber) {
                dispatch(setRecordId(data.newRecordId));
                dispatch(setToken(data.token));
                dispatch(setTicketNumber(data.newTicketNumber));
                dispatch(
                    setNames({
                        nameEn: data.nameEn,
                        nameKk: data.nameKk,
                        nameRu: data.nameRu,
                    })
                );
                dispatch(setWasRedirected(true));
                navigate("/wait");
                window.location.href = "/wait";
            }
        });

        return () => {
            connection.off("ReceiveRecordCreated");
            connection.off("RecieveUpdateRecord");
            connection.off("RecieveAcceptRecord");
            connection.off("RecieveRedirectClient");
            window.speechSynthesis.cancel(); // Остановить звук при уходе
        };
    }, [storedTicketNumber, navigate, recordId, registerClient, ticketNumber, dispatch]);

    const handleModalOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const handleNavige = () => {
        navigate("/");
    };

    const handleConfirmRefuse = async () => {
        if (!recordId) return;
        try {
            await updateQueueItem({ id: recordId }).unwrap();
        } catch (error) {
            console.error("Ошибка при отмене очереди:", error);
        }
        localStorage.removeItem("recordId");
        localStorage.removeItem("ticketNumber");
        dispatch(setTicketNumber(null));
        localStorage.removeItem("token");
        setStoredRecordId(null);
        dispatch(setRecordId(null));
        dispatch(setToken(null));
        navigate("/");
        setIsOpen(false);
    };

    const handleAvtomaticConfirmRefuse = async () => {
        if (!recordId) return;
        try {
            await updateQueueItem({ id: recordId }).unwrap();
        } catch (error) {
            console.error("Ошибка при отмене очереди:", error);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("recordId");
        localStorage.removeItem("ticketNumber");
        dispatch(setTicketNumber(null));
        dispatch(setRecordId(null));
        dispatch(setToken(null));
        setIsOpen(false);
        setStoredRecordId(null);
    };

    return (
        <BackgroundContainer>
            <Box sx={{ paddingBottom: theme.spacing(5) }}>
                {theme.palette.mode === 'dark' ? <SULogoMDark /> : <SULogoM />}
            </Box>
            <FormContainer>
                {!expired ? (
                    <>
                        <Typography
                            variant="h4"
                            sx={{ marginBottom: 2 }}
                        >
                            {t("i18n_queue.approachWindow")} {windowNumber}
                        </Typography>
                        <Typography
                            variant="h4"
                            sx={{
                                marginBottom: 2,
                                marginTop: 2,
                            }}
                        >
                            {roomName}
                        </Typography>

                        <Timer
                            onTimeout={() => {
                                setExpired(true);
                                handleAvtomaticConfirmRefuse();
                            }}
                        />

                        <Box sx={{ paddingTop: theme.spacing(5) }}>
                            <CustomButton
                                variantType="danger"
                                onClick={handleModalOpen}
                            >
                                {t("i18n_queue.refuse")}
                            </CustomButton>
                        </Box>
                    </>
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: theme.spacing(2),
                        }}
                    >
                        <Typography variant="h5">
                            {t("i18n_queue.timeoutMessage")}
                        </Typography>
                        <CustomButton
                            variantType="primary"
                            sizeType="medium"
                            onClick={handleNavige}
                        >
                            {t("i18n_queue.signUp")}
                        </CustomButton>
                    </Box>
                )}
            </FormContainer>

            <ReusableModal
                open={isOpen}
                onClose={handleClose}
                width={340}
                showCloseButton={false}
            >
                <RefuseModalBox>
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
                </RefuseModalBox>
            </ReusableModal>
        </BackgroundContainer>
    );
};

export default CallPage;