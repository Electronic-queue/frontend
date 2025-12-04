import { useEffect, useReducer, useCallback, useState, useRef } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { SULogoM } from "src/assets";
import theme from "src/styles/theme";
import CustomButton from "src/components/Button";
import ReusableModal from "src/components/ModalPage";

import {
    useGetClientRecordByIdQuery,
    useGetRecordIdByTokenQuery,
    useUpdateQueueItemMutation,
    useGetTicketNumberByTokenQuery,
} from "src/store/userApi";
import connection, { startSignalR } from "src/features/signalR";
import { useDispatch, useSelector } from "react-redux";
import {
    setToken,
    setRecordId,
    setTicketNumber,
} from "src/store/userAuthSlice";
import { useNavigate } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import { RootState } from "src/store/store";
import i18n from "src/i18n";
import { useRegisterClientMutation } from "src/store/signalRClientApi";

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
    gap: theme.spacing(2),
}));
interface RefuseModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
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

const RefuseModal = ({ open, onClose, onConfirm }: RefuseModalProps) => {
    const { t } = useTranslation();
    return (
        <ReusableModal
            open={open}
            onClose={onClose}
            width={340}
            showCloseButton={false}
        >
            <Box display="flex" flexDirection="column" gap={2} alignItems="center">
                <Typography variant="h4">{t("i18n_queue.refuseQueue")}</Typography>
                <Box sx={{ display: "flex", gap: theme.spacing(2) }}>
                    <CustomButton variantType="primary" onClick={onConfirm}>
                        {t("i18n_queue.confirm")}
                    </CustomButton>
                    <CustomButton variantType="primary" onClick={onClose}>
                        {t("i18n_queue.cancel")}
                    </CustomButton>
                </Box>
            </Box>
        </ReusableModal>
    );
};

const WaitingPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const recordId = useSelector((state: RootState) => state.user.recordId);
    const wasRedirected = useSelector((state: RootState) => state.user.wasRedirected);
    const cabinetNameRu = useSelector((state: RootState) => state.user.nameRu);
    const cabinetNameKk = useSelector((state: RootState) => state.user.nameKk);
    const cabinetNameEn = useSelector((state: RootState) => state.user.nameEn);
    const ticketNumber = useSelector((state: RootState) => state.user.ticketNumber);

    const { data: ticketData, refetch: refetchTicketNumber } = useGetTicketNumberByTokenQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    const { data: tokenData, isFetching: isFetchingRecordId, refetch } = useGetRecordIdByTokenQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    const { data: clientRecord } = useGetClientRecordByIdQuery(recordId ?? 0, {
        skip: !recordId,
    });
    console.log("client reocored", clientRecord)
    const [updateQueueItem, { isLoading: isUpdating }] = useUpdateQueueItemMutation();
    const [registerClient] = useRegisterClientMutation();

    const [recordData, setRecordData] = useState<ClientRecord | null>(null);
    const [isOpen, toggleModal] = useReducer((open) => !open, false);
    const hasRegistered = useRef(false);

    useEffect(() => {
        if (ticketData?.ticketNumber && ticketData.ticketNumber !== ticketNumber) {
            dispatch(setTicketNumber(ticketData.ticketNumber));
        }
    }, [ticketData, ticketNumber, dispatch]);

    useEffect(() => {
        if (tokenData?.recordId && tokenData.recordId !== recordId) {
            dispatch(setRecordId(tokenData.recordId));
        }
    }, [tokenData, recordId, dispatch]);

    const token = localStorage.getItem("token");
    useEffect(() => {
        if (token) {
            refetch();
            refetchTicketNumber();
        }
    }, [token]);
    useEffect(() => {
        if (clientRecord) {
            setRecordData(clientRecord);
        }
    }, [clientRecord]);

useEffect(() => {
        if (!recordId) return;

        let isMounted = true;

        const initSignalR = async () => {
            // 1. Проверка на повторный вход
            if (hasRegistered.current) {
                console.log("🔒 Уже зарегистрированы (skip)");
                return;
            }

            try {
                console.log("🚀 Запуск initSignalR...");

                // 2. Если не подключены - подключаемся
                if (connection.state !== "Connected") {
                    console.log("🔌 Статус не Connected, вызываем startSignalR...");
                    await startSignalR();
                }

                // 3. ЖДЕМ ID (Самое важное исправление)
                // Ждем до 5 секунд (10 попыток по 500мс), пока появится ID
                let attempts = 0;
                while (!connection.connectionId && attempts < 10) {
                    if (!isMounted) return; // Если ушли со страницы - прекращаем ждать
                    console.log(`⏳ Ждем Connection ID... Попытка ${attempts + 1}/10`);
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    attempts++;
                }

                const finalConnectionId = connection.connectionId;
                console.log("🆔 Final Connection ID:", finalConnectionId);

                // 4. Регистрируем клиента
                if (finalConnectionId && isMounted) {
                    console.log("nt Отправка registerClient...");
                    
                    const response = await registerClient({
                        connectionId: finalConnectionId
                    }).unwrap();

                    console.log("✅ Клиент успешно зарегистрирован:", response);
                    hasRegistered.current = true;
                } else {
                    console.warn("⚠️ Тайм-аут: Connection ID так и не пришел или компонент размонтирован");
                }

            } catch (err) {
                console.error("❌ Ошибка в процессе регистрации:", err);
                hasRegistered.current = false;
            }
        };

        initSignalR();

        // Подписки на события
        const handleRecordCreated = (newRecord: any) => {
           console.log("recordCreated", newRecord)
        };

        const handleRecordCalled = () => {
            navigate("/call", { replace: true });
        };
        
    const handleQueueUpdate = (positionUpdate: Record<string, number>) => {
            console.log("Queue update received:", positionUpdate);

            // Проверяем, есть ли наш ID в списке обновлений
            // Обращаемся к объекту по ключу [recordId]
            if (recordId && positionUpdate[recordId] !== undefined) {
                const newClientNumber = positionUpdate[recordId];
                
                console.log(`📉 Очередь сдвинулась! Перед вами теперь: ${newClientNumber}`);

                // Обновляем стейт, чтобы React перерисовал цифру
                setRecordData((prevData) => {
                    // Если prevData еще нет, берем данные из clientRecord (начальные данные)
                    const currentData = prevData || clientRecord;

                    if (!currentData) return null;

                    return {
                        ...currentData,
                        clientNumber: newClientNumber, // Записываем новое число
                    };
                });
            }
        };
        connection.on("ReceiveRecordCreated", handleRecordCreated);
        connection.on("RecordCalled", handleRecordCalled);
        connection.on("QueuePositionUpdate", handleQueueUpdate);

        return () => {
            console.log("🧹 Cleanup WaitingPage");
            isMounted = false;
            // Сбрасываем флаг, чтобы при возврате можно было снова зарегистрироваться
            hasRegistered.current = false;

            connection.off("ReceiveRecordCreated", handleRecordCreated);
            connection.off("RecordCalled", handleRecordCalled);
            connection.off("QueuePositionUpdate", handleQueueUpdate);
        };
    }, [recordId, ticketNumber, navigate, registerClient, refetch, clientRecord]);    

     const handleConfirmRefuse = useCallback(async () => {
        if (!recordId) return;
        try {
            await updateQueueItem({ id: recordId }).unwrap();
        } catch (error) {
            console.error("Ошибка при обновлении очереди:", error);
        }
        
        localStorage.removeItem("token");
        localStorage.removeItem("recordId");
        localStorage.removeItem("ticketNumber");
        
        dispatch(setTicketNumber(null));
        dispatch(setToken(null));
        dispatch(setRecordId(null));
        
        connection.off("ReceiveRecordCreated");
        connection.off("RecieveUpdateRecord");
        
        
        navigate("/");
    }, [recordId, dispatch, navigate, updateQueueItem]);
    
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
                <Typography variant="h6">{t("i18n_queue.noNotifications")}</Typography>
            </BackgroundContainer>
        );
    }

    const activeRecord = recordData || clientRecord;

    const displayedName =
        (i18n.language === "kz"
            ? wasRedirected
                ? cabinetNameKk
                : activeRecord?.nameKk
            : i18n.language === "en"
            ? wasRedirected
                ? cabinetNameEn
                : activeRecord?.nameEn
            : wasRedirected
            ? cabinetNameRu
            : activeRecord?.nameRu) || "—";

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
                    <Typography variant="h4">
                        {t("i18n_queue.number")} {ticketNumber ? `${ticketNumber}` : ""}
                    </Typography>
                </Box>

                <InfoBlock>
                    {activeRecord ? (
                        <>
                            <Typography variant="h6">
                                {displayedName?.trim() ? displayedName : "—"}
                            </Typography>

                            <Typography variant="h6">
                                {t("i18n_queue.window")}: {activeRecord.windowNumber ?? "—"}
                            </Typography>
                            <Typography variant="h6">
                                {t("i18n_queue.peopleAhead")}: {activeRecord.clientNumber ?? "—"}
                            </Typography>
                            <Typography variant="h6">
                                {t("i18n_queue.expectedTime")}:{" "}
                                {activeRecord.expectedAcceptanceTime ?? "—"}
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Skeleton variant="rectangular" width="100%" height={30} />
                            <Skeleton variant="rectangular" width="100%" height={30} />
                            <Skeleton variant="rectangular" width="100%" height={30} />
                        </>
                    )}
                </InfoBlock>

                <Box sx={{ paddingTop: theme.spacing(5) }}>
                    <CustomButton
                        variantType="danger"
                        fullWidth
                        onClick={toggleModal}
                        disabled={isUpdating}
                    >
                        {t("i18n_queue.refuse")}
                    </CustomButton>
                </Box>
            </FormContainer>
            <RefuseModal
                open={isOpen}
                onClose={toggleModal}
                onConfirm={handleConfirmRefuse}
            />
        </BackgroundContainer>
    );
};

export default WaitingPage;