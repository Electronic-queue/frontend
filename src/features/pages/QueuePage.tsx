import { FC, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import CustomButton from "../../components/Button";
import StatusCard from "../../widgets/statusCard/ui/StatusCard";
import ClientCard from "../../widgets/clientCard/ui/ClientCard";
import QueueCard from "src/widgets/queueCard/ui/QueueCard";
import ReusableModal from "src/components/ModalPage";
import theme from "src/styles/theme";
import SelectTime from "src/widgets/selectTiem/ui/SelectTime";
import Timer from "src/widgets/timer/ui/Timer";
import {
    useAcceptClientMutation,
    useCallNextMutation,
    useRedirectClientMutation,
    useCompleteClientMutation,
    useGetRecordListByManagerQuery,
    usePauseWindowMutation,
    useGetManagerIdQuery,
    useCancelQueueMutation,
} from "src/store/managerApi";
import { Alert, Button, Snackbar } from "@mui/material";
import connection, { startSignalR } from "src/features/signalR";
import i18n from "src/i18n";
type StatusType = "idle" | "called" | "accepted" | "redirected";
import LoopIcon from "@mui/icons-material/Loop";
import { useNavigate } from "react-router-dom";
import { useRegisterManagerMutation } from "src/store/signalRManagerApi";
import { useSelector } from "react-redux";
import { RootState } from "src/store/store";

type clientListSignalR = {
    ticketNumber: number;
    lastName: string;
    firstName: string;
    serviceNameRu: string;
    serviceNameKk: string;
    serviceNameEn: string;
    serviceId: string;
    managerId: string;
    surname: string;
    iin: string;
    expectedAcceptanceTime: string;
    createdOn: string;
    averageExecutionTime: number;
};
type managerStatic = {
    managerId: string;
    serviced: number;
    rejected: number;
    redirected: number;
    inLine: number;
};
const ButtonWrapper = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    display: "flex",
    gap: theme.spacing(3),
    justifyContent: "flex-start",
    flexDirection: "row",
}));

const StatusCardWrapper = styled(Stack)(({ theme }) => ({
    display: "flex",
    flexDirection: "row",
    gap: theme.spacing(3),
    justifyContent: "center",
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(6),
}));

const clientData1 = {
    clientNumber: "-",
    lastName: "-",
    firstName: "-",
    patronymic: "-",
    service: "-",
    iin: "-",
};
const serviceTime1 = "0";
const QueuePage: FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [selectedTime, setSelectedTime] = useState<number>(1);
    const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
    const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
    const [acceptClient] = useAcceptClientMutation();
    const currentLanguage = i18n.language || "ru";
    const [callNext] = useCallNextMutation();
    const [completeClient] = useCompleteClientMutation();
    const [pauseWindow] = usePauseWindowMutation();
    const [cancelQueue] = useCancelQueueMutation();
     const [registerManager, { isLoading: isRegistering }] = useRegisterManagerMutation();
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "warning" | "info";
    }>({ open: false, message: "", severity: "success" });

    const [status, setStatus] = useState<StatusType>("idle");

    const managerId: number = 6;
    const [clientsSignalR, setClientsSignalR] = useState<clientListSignalR[]>(
        []
    );
    const [managerStatic, setManagerStatic] = useState<managerStatic>();

    const { refetch: refetchClients } = useGetRecordListByManagerQuery();
    useEffect(() => {
        refetchClients();
    }, []);

    useEffect(() => {
        const savedStatus = sessionStorage.getItem("clientStatus");
        if (savedStatus) {
            setStatus(savedStatus as StatusType);
        }
    }, []);

    const firstClient = clientsSignalR?.[0] || null;

    const { data: managerIdData } = useGetManagerIdQuery() as {
        data?: string | undefined;
    };

    useEffect(() => {
        sessionStorage.setItem("clientStatus", status);
    }, [status]);

    useEffect(() => {
        if (clientsSignalR.length === 0) {
            setStatus("idle");
            sessionStorage.removeItem("clientStatus");
        } else if (status === "idle" && clientsSignalR.length > 0) {
            sessionStorage.setItem("clientStatus", "called");
        }
    }, [clientsSignalR]);
    useEffect(() => {
            startSignalR();
        }, []);        
        
    useEffect(() => {
        if (!managerIdData) return;

        const setupSignalR = async () => {
            connection.on("ManagerQueueSnapshot",  (dataManager) => {
                console.log(dataManager)
            })
            connection.on("ClientListByManagerId", (clientListSignalR) => {
                console.log(
                    "🔥 ClientListByManagerId получен:",
                    clientListSignalR
                );
                if (!Array.isArray(clientListSignalR)) return;
                if (
                    clientListSignalR.length === 0 ||
                    String(clientListSignalR[0].managerId) ===
                        String(managerIdData)
                ) {
                    setClientsSignalR(clientListSignalR);
                }
            });

            connection.on("RecieveManagerStatic", (managerStatic) => {
                console.log("🔥 RecieveManagerStatic получен:", managerStatic);
                if (String(managerStatic.managerId) === String(managerIdData)) {
                    setManagerStatic(managerStatic);
                }
            });
        
            connection.on("ReceiveManagersStatic", (windowInfo) => {
                console.log("🔥 ReceiveManagersStatic получен:", windowInfo);
            });

            try {
                // Проверяем статус, чтобы не пытаться подключиться дважды
                if (connection.state === "Disconnected") {
                    await startSignalR();
                    console.log("✅ SignalR подключен успешно");
                }
            } catch (err) {
                console.error("❌ Ошибка подключения SignalR: ", err);
            }
        };

        setupSignalR();

        // --- 3. ОЧИСТКА ПРИ РАЗМОНТИРОВАНИИ ---
        return () => {
            // Обязательно удаляем подписки, чтобы не дублировались вызовы
            connection.off("ClientListByManagerId");
            connection.off("RecieveManagerStatic");
            connection.off("ReceiveManagersStatic");
            connection.off("ManagerQueueSnapshot")
        };
    }, [managerIdData]); // Перезапуск эффекта, если изменится ID менеджера
    
    const handleUpdateClientList = async () => {
        try {
            const { data } = await refetchClients();
            if (data) {
                setClientsSignalR(data as unknown as clientListSignalR[]);
                setSnackbar({
                    open: true,
                    message: t("i18n_queue.clientListUpdated"),
                    severity: "success",
                });
            }
        } catch (error) {
            console.error("Error updating client list:", error);
            setSnackbar({
                open: true,
                message: t("i18n_queue.updateError"),
                severity: "error",
            });
        }
    };

    const handlePauseWindow = async () => {
        try {
            await pauseWindow({
                managerId,
                exceedingTime: selectedTime,
            }).unwrap();
            setIsPauseModalOpen(false);
            setIsTimerModalOpen(true);
            setSnackbar({
                open: true,
                message: t("i18n_queue.windowPaused"),
                severity: "success",
            });
            if (clientsSignalR.length > 1) {
                setStatus("called");
                sessionStorage.setItem("clientStatus", "called");
            } else {
                setClientsSignalR([]);
                setStatus("idle");
                sessionStorage.removeItem("clientStatus");
            }
        } catch (error) {
            console.error("Error while pausing the window:", error);
            setSnackbar({
                open: true,
                message: t("i18n_queue.pauseError"),
                severity: "error",
            });
        }
    };
    const handleCancelQueue = async () => {
        try {
            await cancelQueue({}).unwrap();
            setSnackbar({
                open: true,
                message: t("i18n_queue.queueCanceled"),
                severity: "success",
            });
            setStatus("idle");
            sessionStorage.removeItem("clientStatus");
        } catch (err) {
            console.error("Error while canceling the queue:", err);
            setSnackbar({
                open: true,
                message: t("i18n_queue.cancelError"),
                severity: "error",
            });
        }
    };

    const handleAcceptClient = async () => {
        try {
            await acceptClient({}).unwrap();
            setSnackbar({
                open: true,
                message: t("i18n_queue.clientAccepted"),
                severity: "success",
            });

            setStatus("accepted");
            sessionStorage.setItem("clientStatus", "accepted");
        } catch (err) {}
    };

    const handleRedirectClient = () => {
        try {
            setSnackbar({
                open: true,
                message: t("i18n_queue.clientRedirected"),
                severity: "success",
            });

            refetchClients();

            if (clientsSignalR.length > 1) {
                setStatus("called");
                sessionStorage.setItem("clientStatus", "called");
            } else {
                setStatus("idle");
                sessionStorage.removeItem("clientStatus");
            }
        } catch (err) {}
    };

    const handleCallNextClient = async () => {
        if (clientsSignalR.length === 0) {
            setSnackbar({
                open: true,
                message: t("i18n_queue.emptyQueue"),
                severity: "warning",
            });
            return;
        }
        try {
            await callNext({}).unwrap();
            setSnackbar({
                open: true,
                message: t("i18n_queue.startQueue"),
                severity: "success",
            });

            setStatus("called");
            sessionStorage.setItem("clientStatus", "called");
            refetchClients();
        } catch (err) {
            setSnackbar({
                open: true,
                message: "Ошибка вызова клиента",
                severity: "error",
            });
        }
    };

    const handleСompleteClient = async () => {
        try {
            await completeClient({ managerId }).unwrap();
            setSnackbar({
                open: true,
                message: t("i18n_queue.serviceCompleted"),
                severity: "success",
            });

            await refetchClients();

            if (clientsSignalR.length > 1) {
                setStatus("called");
                sessionStorage.setItem("clientStatus", "called");
            } else {
                setClientsSignalR([]);
                setStatus("idle");
                sessionStorage.removeItem("clientStatus");
            }
        } catch (err) {
            console.error("Error completing client:", err);
        }
    };
const handleTestRegistry = async () => {
    try {
        console.log("🚀 1. Начинаем процесс регистрации...");
        
        // Получаем ID
        const connectionId = await startSignalR();
        console.log("🔗 2. Connection ID от SignalR:", connectionId);

        if (!connectionId) {
            console.error("❌ Ошибка: Connection ID равен null или undefined");
            return;
        }

        // Отправляем запрос
        console.log("📡 3. Отправляем запрос на api/registry/manager...");
        const response = await registerManager({ connectionId }).unwrap();
        
        console.log("✅ 4. УСПЕХ! Ответ сервера:", response);
        
    } catch (error: any) {
        console.error("🔥 ОШИБКА ПРИ РЕГИСТРАЦИИ:", error);

        // Расшифровка ошибки RTK Query
        if (error?.status) {
            console.error(`❌ Статус HTTP: ${error.status}`);
            console.error("❌ Тело ошибки:", error.data);
            
            if (error.status === 401) {
                console.warn("⚠️ Возможно, проблема с Токеном (Authorization header).");
            }
            if (error.status === 'FETCH_ERROR') {
                console.warn("⚠️ Ошибка сети или SSL сертификата (Failed to fetch).");
            }
        }
    }
};

    const getServiceName = (item: clientListSignalR, lang: string) => {
        switch (lang) {
            case "en":
                return item.serviceNameEn;
            case "kz":
                return item.serviceNameKk;
            default:
                return item.serviceNameRu;
        }
    };
    const clientData = firstClient
        ? {
              clientNumber: `${firstClient.ticketNumber}`,
              lastName: firstClient.lastName,
              firstName: firstClient.firstName,
              patronymic: firstClient.surname || "",
              service: getServiceName(firstClient, currentLanguage),
              iin: firstClient.iin,
          }
        : null;

    const handlePauseModalOpen = () => {
        setIsPauseModalOpen(true);
        setSelectedTime(1);
    };

    const [rotateIcon, setRotateIcon] = useState(false);

    return (
        <>
            <Box sx={{ position: "fixed", bottom: 16, left: 16 }}>
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() =>
                        setSnackbar({
                            open: false,
                            message: "",
                            severity: "success",
                        })
                    }
                >
                    <Alert
                        severity={snackbar.severity}
                        onClose={() =>
                            setSnackbar({
                                open: false,
                                message: "",
                                severity: "success",
                            })
                        }
                        sx={{ fontSize: theme.typography.body1.fontSize }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                }}
            >
                <ButtonWrapper>
                    <CustomButton
                        variantType="primary"
                        sizeType="medium"
                        onClick={() => handlePauseModalOpen()}
                    >
                        {t("i18n_queue.pause")}
                    </CustomButton>
                    <CustomButton
                        variantType="primary"
                        sizeType="medium"
                        onClick={() => handleCancelQueue()}
                    >
                        {t("i18n_queue.cancelQueue")}
                    </CustomButton>
                    <CustomButton
                        variantType="primary"
                        sizeType="medium"
                        onClick={() => navigate("/monitor")}
                    >
                        {t("i18n_queue.monitor")}
                    </CustomButton>
                </ButtonWrapper>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <CustomButton
                        variantType="primary"
                        sizeType="medium"
                        onClick={() => {
                            setIsPauseModalOpen(false);
                            handleUpdateClientList();
                            setRotateIcon(true);
                            setTimeout(() => setRotateIcon(false), 500);
                        }}
                        sx={{
                            marginRight: theme.spacing(3),
                        }}
                    >
                        <LoopIcon
                            sx={{
                                transition: "transform 0.5s ease",
                                transform: rotateIcon
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                            }}
                        />
                    </CustomButton>
                </Box>
            </Box>

            <StatusCardWrapper>
                <StatusCard
                    variant="accepted"
                    number={managerStatic?.serviced || 0}
                />
                <StatusCard
                    variant="not_accepted"
                    number={managerStatic?.rejected || 0}
                />
                <StatusCard
                    variant="redirected"
                    number={managerStatic?.redirected || 0}
                />
                <StatusCard
                    variant="in_anticipation"
                    number={managerStatic?.inLine || 0}
                />
            </StatusCardWrapper>

            <ClientCard
                clientData={firstClient ? clientData! : clientData1}
                serviceTime={
                    firstClient
                        ? String(firstClient.averageExecutionTime)
                        : serviceTime1
                }
                onRedirect={handleRedirectClient}
                onAccept={handleAcceptClient}
                callNext={handleCallNextClient}
                onComplete={handleСompleteClient}
                status={status}
            />

            <Box
                sx={{
                    display: "flex",
                    gap: 3,
                    paddingBottom: theme.spacing(3),
                }}
            >
                {Array(4)
                    .fill(null)
                    .map((_, index) => {
                        const item = clientsSignalR?.[index + 1];
                        return item ? (
                            <QueueCard
                                key={item.ticketNumber}
                                clientNumber={item.ticketNumber}
                                service={getServiceName(item, currentLanguage)}
                                bookingTime={new Date(
                                    item.createdOn ?? ""
                                ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                                expectedTime={item.expectedAcceptanceTime}
                            />
                        ) : (
                            <QueueCard
                                key={`mock-${index}`}
                                clientNumber={0}
                                service="-"
                                bookingTime="-"
                                expectedTime="-"
                            />
                        );
                    })}
            </Box>

            <ReusableModal
                open={isPauseModalOpen}
                onClose={() => setIsPauseModalOpen(false)}
                title={t("i18n_queue.stopWindow")}
                width={theme.spacing(99)}
                height={theme.spacing(29)}
                showCloseButton={false}
            >
                <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <SelectTime
                            onTimeSelect={(time) => setSelectedTime(time)}
                        />
                    </Box>
                    <CustomButton
                        variantType="primary"
                        sizeType="medium"
                        onClick={() => {
                            setIsPauseModalOpen(false);
                            setIsTimerModalOpen(true);
                            handlePauseWindow();
                        }}
                    >
                        {t("i18n_queue.pauseWindow")}
                    </CustomButton>
                </Box>
            </ReusableModal>

            <ReusableModal
                open={isTimerModalOpen}
                onClose={() => setIsTimerModalOpen(false)}
                title={t("i18n_queue.windowPausedMessage")}
                width={theme.spacing(99)}
                showCloseButton={false}
                ignoreBackdropClick={true}
            >
                <Timer
                    initialTime={selectedTime}
                    onResume={() => setIsTimerModalOpen(false)}
                    managerId={managerId}
                />
            </ReusableModal>
            <Button onClick={handleTestRegistry}>Button</Button>
        </>
    );
};

export default QueuePage;
