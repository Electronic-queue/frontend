import { FC, useState, useEffect, useRef } from "react";
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
    useStartWindowMutation,
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
import React from "react";


type ClientData = {
    clientNumber: number;
    ticketNumber: number;
    lastName: string | null;
    firstName: string | null;
    surname: string | null; 
    serviceNameRu: string;
    serviceNameKk: string;
    serviceNameEn: string;
    iin: string;
    expectedAcceptanceTime: string;
    createdOn?: string;
    averageExecutionTime: number;
    statusId?: number; 
    serviceId?: string; 
    managerId?: string;
};
type ManagerSnapshotData = {
    managerId: string;
    activeClient: ClientData | null; // 👈 Используем ClientData вместо any
    queue: ClientData[];
    stats: {
        inLine: number;
        redirected: number;
        rejected: number;
        serviced: number;
    };
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

const defaultClientData = {
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
    const [acceptClient, { isLoading: isAccepting }] = useAcceptClientMutation();
    const currentLanguage = i18n.language || "ru";
    const [callNext, { isLoading: isCallingNext }] = useCallNextMutation();
    const [completeClient, { isLoading: isCompleting }] = useCompleteClientMutation();
    const [pauseWindow] = usePauseWindowMutation();
    const [cancelQueue] = useCancelQueueMutation();
    const [startWindow] = useStartWindowMutation();
    
     const [registerManager, { isLoading: isRegistering }] = useRegisterManagerMutation();
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "warning" | "info";
    }>({ open: false, message: "", severity: "success" });

    const isActionLoading = isAccepting || isCallingNext || isCompleting;

    const managerId: number = 6;
 
    const [snapshot, setSnapshot] = useState<ManagerSnapshotData | null>(null)
// 1. Статус текущего окна (на основе activeClient из снепшота)
    const getComputedStatus = (): StatusType => {
        const active = snapshot?.activeClient;
        if (!active) return "idle"; // Если активного нет -> idle
        
        // Маппинг statusId из бекенда
        if (active.statusId === 3) return "called"; // Вызван
        if (active.statusId === 4) return "accepted"; // Принят
        
        return "idle"; // -1 или любой другой
    };

    const computedStatus = getComputedStatus();

    
    // 2. Кого показывать в Главной Карточке (ClientCard)?
    // Если статус не idle -> показываем Активного клиента.
    // Если статус idle -> показываем Первого в очереди (preview), чтобы знать кого вызывать.
    

    const { refetch: refetchClients } = useGetRecordListByManagerQuery();
    useEffect(() => {
        refetchClients();
    }, []);


    const { data: managerIdData } = useGetManagerIdQuery() as {
        data?: string | undefined;
    };
              
    useEffect(() => {
        if (!managerIdData) return;

        const setupSignalR = async () => {
            connection.on("ManagerQueueSnapshot",  (data: ManagerSnapshotData) => {
                console.log(data)
                setSnapshot(data); 
       
            })
            // connection.on("ClientListByManagerId", (ClientData) => {
            //     console.log(
            //         "🔥 ClientListByManagerId получен:",
            //         ClientData
            //     );
            //     if (!Array.isArray(ClientData)) return;
            //     if (
            //         ClientData.length === 0 ||
            //         String(ClientData[0].managerId) ===
            //             String(managerIdData)
            //     ) {
            //         setClientsSignalR(ClientData);
            //     }
            // });
        
            // connection.on("ReceiveManagersStatic", (windowInfo) => {
            //     console.log("🔥 ReceiveManagersStatic получен:", windowInfo);
            // });

            // try {
            //     // Проверяем статус, чтобы не пытаться подключиться дважды
            //     if (connection.state === "Disconnected") {
            //         await startSignalR();
            //         console.log("✅ SignalR подключен успешно");
            //     }
            // } catch (err) {
            //     console.error("❌ Ошибка подключения SignalR: ", err);
            // }
        };

        setupSignalR();

        // --- 3. ОЧИСТКА ПРИ РАЗМОНТИРОВАНИИ ---
        return () => {
            // Обязательно удаляем подписки, чтобы не дублировались вызовы
            // connection.off("ClientListByManagerId");
            // connection.off("RecieveManagerStatic");
            // connection.off("ReceiveManagersStatic");
            connection.off("ManagerQueueSnapshot")
        };
    }, [managerIdData]); 
    const hasRegistered = useRef(false);

    useEffect(() => {
        let isMounted = true;

        const initAndRegister = async () => {
            if (hasRegistered.current) return;
            let connectionId = await startSignalR();
            let attempts = 0;
            while (!connectionId && attempts < 10 && isMounted) {
                console.log(`⏳ ID нет, ждем... (Попытка ${attempts + 1})`);
                await new Promise((resolve) => setTimeout(resolve, 500)); 
                
                if (connection.state === "Connected" && connection.connectionId) {
                    connectionId = connection.connectionId;
                } else {
                    connectionId = await startSignalR();
                }
                attempts++;
            }

            if (connectionId && isMounted) {
                try {
                    console.log("🔗 ID получен:", connectionId);
                    await registerManager({ connectionId: connectionId }).unwrap();
                    console.log("✅ Успешная авто-регистрация менеджера!");
                     await startWindow({ managerId }).unwrap();
                     console.log("✅ Окно успешно запущено автоматически");
                    hasRegistered.current = true; // Запоминаем успех
                } catch (err) {
                    console.error("🔥 Ошибка при вызове registerManager:", err);
                }
            } else {
                console.warn("⚠️ Не удалось получить ID после нескольких попыток.");
            }
        };

        initAndRegister();

        return () => { isMounted = false; };
    }, []);
   



    const handleUpdateClientList = async () => {
        try {
            const { data } = await refetchClients();
            if (data) {
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

    // const handlePauseWindow = async () => {
    //     try {
    //         await pauseWindow({
    //             managerId,
    //             exceedingTime: selectedTime,
    //         }).unwrap();
    //         setIsPauseModalOpen(false);
    //         setIsTimerModalOpen(true);
    //         setSnackbar({
    //             open: true,
    //             message: t("i18n_queue.windowPaused"),
    //             severity: "success",
    //         });
    //         if (clientsSignalR.length > 1) {
    //             setStatus("called");
    //             sessionStorage.setItem("clientStatus", "called");
    //         } else {
    //             setClientsSignalR([]);
    //             setStatus("idle");
    //             sessionStorage.removeItem("clientStatus");
    //         }
    //     } catch (error) {
    //         console.error("Error while pausing the window:", error);
    //         setSnackbar({
    //             open: true,
    //             message: t("i18n_queue.pauseError"),
    //             severity: "error",
    //         });
    //     }
    // };
    const handleCancelQueue = async () => {
        try {
            await cancelQueue({}).unwrap();
            setSnackbar({
                open: true,
                message: t("i18n_queue.queueCanceled"),
                severity: "success",
            });

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

        } catch (err) {}
    };

const handleCallNextClient = async () => {
        // Проверяем очередь через snapshot
        if (!snapshot?.queue?.length) {
            setSnackbar({
                open: true,
                message: t("i18n_queue.emptyQueue"),
                severity: "warning",
            });
            return;
        }
        
        // 👇 РАСКОММЕНТИРУЙ ЭТОТ БЛОК 👇
        try {
           await callNext({}).unwrap();
           // setStatus и sessionStorage здесь больше не нужны, интерфейс обновит snapshot
           setSnackbar({
               open: true,
               message: t("i18n_queue.startQueue"),
               severity: "success",
           });
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
        } catch (err) {
            console.error("Error completing client:", err);
        }
    };


    const getServiceName = (item: ClientData, lang: string) => {
        switch (lang) {
            case "en":
                return item.serviceNameEn;
            case "kz":
                return item.serviceNameKk;
            default:
                return item.serviceNameRu;
        }
    };
    const uniqueQueue = React.useMemo(() => {
        if (!snapshot?.queue) return [];
        
        // Оставляем только те записи, у которых ticketNumber встречается впервые
        return snapshot.queue.filter((client, index, self) => 
            index === self.findIndex((t) => (
                t.ticketNumber === client.ticketNumber
            ))
        );
    }, [snapshot]);
    const displayClientObj = (computedStatus !== "idle" && snapshot?.activeClient && snapshot.activeClient.ticketNumber !== -1)
        ? snapshot.activeClient
        : uniqueQueue[0];
    

    const formattedClientData = displayClientObj
        ? {
              clientNumber: `${displayClientObj.ticketNumber}`,
              lastName: displayClientObj.lastName || "-",
              firstName: displayClientObj.firstName || "-",
              patronymic: displayClientObj.surname || "-",
              service: getServiceName(displayClientObj, currentLanguage),
              iin: displayClientObj.iin || "-",
          }
        : defaultClientData;


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
                <StatusCard variant="accepted" number={snapshot?.stats.serviced || 0} />
                <StatusCard variant="not_accepted" number={snapshot?.stats.rejected || 0} />
                <StatusCard variant="redirected" number={snapshot?.stats.redirected || 0} />
                <StatusCard variant="in_anticipation" number={snapshot?.stats.inLine || 0} />
            </StatusCardWrapper>

           <ClientCard
                clientData={formattedClientData} // 👈 Новые подготовленные данные
                serviceTime={displayClientObj ? String(displayClientObj.averageExecutionTime) : serviceTime1}
                onRedirect={handleRedirectClient}
                onAccept={handleAcceptClient}
                callNext={handleCallNextClient}
                onComplete={handleСompleteClient}
                status={computedStatus} // 👈 Передаем вычисленный статус
                isLoading={isActionLoading}
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
                        // БЕРЕМ ИЗ uniqueQueue
                        // Логика: если displayClientObj - это uniqueQueue[0], 
                        // то в маленьких карточках показываем начиная с uniqueQueue[1]
                        
                        // Если активный клиент уже вызван (не из очереди), то очередь показываем с 0
                        // Но у вас логика была "index + 1", сохраним её, предполагая, что 0-й элемент сейчас на главном экране
                        const item = uniqueQueue[index + 1];

                        return item ? (
                            <QueueCard
                                // clientNumber в вашей базе уникален (1,2,3,5), используем его для ключа, это надежнее всего
                                key={item.clientNumber} 
                                
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
                    {/* <CustomButton
                        variantType="primary"
                        sizeType="medium"
                        onClick={() => {
                            setIsPauseModalOpen(false);
                            setIsTimerModalOpen(true);
                            handlePauseWindow();
                        }}
                    >
                        {t("i18n_queue.pauseWindow")}
                    </CustomButton> */}
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
        </>
    );
};

export default QueuePage;


