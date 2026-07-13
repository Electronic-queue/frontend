import { FC, useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import StatusCard from "../../widgets/statusCard/ui/StatusCard";
import ClientCard from "../../widgets/clientCard/ui/ClientCard";
import QueueCard from "src/widgets/queueCard/ui/QueueCard";
import theme from "src/styles/theme";
import {
    useAcceptClientMutation,
    useCallNextMutation,
    useCompleteClientMutation,
    useStartWindowMutation,
    useGetManagerIdQuery,
    useRefreshQueueManagerDBMutation,
} from "src/store/managerApi";
import { Alert, Snackbar } from "@mui/material";
import connection, { startSignalR } from "src/features/signalR";
import i18n from "src/i18n";
import { useRegisterManagerMutation } from "src/store/signalRManagerApi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/store/store";
import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "src/store/authSlice";

type StatusType = "idle" | "called" | "accepted" | "redirected";

type ClientData = {
    clientNumber: number;
    ticketNumber: number;
    lastName: string | null;
    firstName: string | null;
    surName: string | null;
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
    activeClient: ClientData | null;
    queue: ClientData[];
    stats: {
        inLine: number;
        redirected: number;
        rejected: number;
        serviced: number;
    };
};

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
    const dispatch = useDispatch();

    const [acceptClient, { isLoading: isAccepting }] =
        useAcceptClientMutation();
    const [callNext, { isLoading: isCallingNext }] = useCallNextMutation();
    const [completeClient, { isLoading: isCompleting }] =
        useCompleteClientMutation();
    const [startWindow] = useStartWindowMutation();
    const [registerManager] = useRegisterManagerMutation();

    const currentLanguage = i18n.language || "ru";
    const token = useSelector((state: RootState) => state.auth.token);

    const previousQueueRef = useRef<number[]>([]);
    const isFirstSnapshotRef = useRef(true);
    const hasRegistered = useRef(false);

    const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
    const isAudioUnlockedRef = useRef(false);

    const [snapshot, setSnapshot] = useState<ManagerSnapshotData | null>(null);
    const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "warning" | "info";
    }>({ open: false, message: "", severity: "success" });

    const isActionLoading = isAccepting || isCallingNext || isCompleting;

    const { data: managerIdData } = useGetManagerIdQuery();
    const managerId = managerIdData ? Number(managerIdData) : 6;
    const [refreshQueueManagerDB] = useRefreshQueueManagerDBMutation();

    const playNewRequestNotification = React.useCallback(async () => {
        if (
            notificationAudioRef.current &&
            isAudioUnlockedRef.current
        ) {
            try {
                notificationAudioRef.current.currentTime = 0;

                await notificationAudioRef.current.play();

                console.log("✅ Звук новой заявки проиграл");
            } catch (error) {
                console.error(
                    "❌ Звук новой заявки не проиграл:",
                    error
                );
            }
        } else {
            console.warn(
                "⚠️ Звук ещё не разблокирован. Пользователь должен один раз кликнуть по странице."
            );
        }

        if (
            "Notification" in window &&
            Notification.permission === "granted"
        ) {
            new Notification("Новая заявка", {
                body: "В очередь поступила новая заявка",
                icon: "/suLogo.svg",
            });
        }

        setSnackbar({
            open: true,
            message: "Поступила новая заявка",
            severity: "info",
        });
    }, []);

    const handleLogout = React.useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("windowInfo");

        dispatch(logout());
        navigate("/login", { replace: true });
    }, [dispatch, navigate])

    const fetchManagerRecords = React.useCallback(async () => {
        if (!token) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/Manager/recordAllListByManager?api-version=v1`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 401) {
                handleLogout();
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const records: ClientData[] = await response.json();

            // Оставляем только заявки со статусом "В очереди"
            const currentQueueRecords = records.filter((item) =>
                [1, 3, 4, 6].includes(item.statusId ?? 0)
            );

            // Сортируем: сначала самая ранняя заявка
            const sortedRecords = [...currentQueueRecords].sort((a, b) => {
                const aTime = a.createdOn
                    ? new Date(a.createdOn).getTime()
                    : Number.MAX_SAFE_INTEGER;

                const bTime = b.createdOn
                    ? new Date(b.createdOn).getTime()
                    : Number.MAX_SAFE_INTEGER;

                if (aTime !== bTime) {
                    return aTime - bTime;
                }

                return a.ticketNumber - b.ticketNumber;
            });

            console.log(
                "✅ Текущая очередь обновлена через GET:",
                sortedRecords
            );

            setSnapshot({
                managerId: "",
                activeClient: null,
                queue: sortedRecords,
                stats: {
                    inLine: sortedRecords.length,
                    redirected: records.filter(
                        (item) => item.statusId === 6
                    ).length,
                    rejected: records.filter(
                        (item) => item.statusId === 7
                    ).length,
                    serviced: records.filter(
                        (item) => item.statusId === 5
                    ).length,
                },
            });

            previousQueueRef.current = sortedRecords.map(
                (item) => item.ticketNumber
            );

            setIsInitialDataLoaded(true);
        } catch (error) {
            console.error(
                "❌ Ошибка получения recordAllListByManager:",
                error
            );

            setIsInitialDataLoaded(true);
        }
    }, [token, handleLogout]);

    useEffect(() => {
        fetchManagerRecords();
    }, [fetchManagerRecords]);

    useEffect(() => {
        notificationAudioRef.current = new Audio("/sounds/new-req.wav");
        notificationAudioRef.current.volume = 1;
        notificationAudioRef.current.preload = "auto";

        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        const unlockAudio = async () => {
            if (
                !notificationAudioRef.current ||
                isAudioUnlockedRef.current
            ) {
                return;
            }

            try {
                const audio = notificationAudioRef.current;

                audio.currentTime = 0;
                audio.volume = 0;

                await audio.play();

                audio.pause();
                audio.currentTime = 0;
                audio.volume = 1;

                isAudioUnlockedRef.current = true;

                console.log("✅ Звук разблокирован");
            } catch (error) {
                console.error(
                    "❌ Не удалось разблокировать звук:",
                    error
                );
            }
        };

        window.addEventListener("pointerdown", unlockAudio, {
            once: true,
        });

        window.addEventListener("keydown", unlockAudio, {
            once: true,
        });

        return () => {
            window.removeEventListener("pointerdown", unlockAudio);
            window.removeEventListener("keydown", unlockAudio);
        };
    }, []);

    const getComputedStatus = (): StatusType => {
        const currentClient =
            snapshot?.activeClient &&
            snapshot.activeClient.ticketNumber !== -1
                ? snapshot.activeClient
                : snapshot?.queue?.[0];

        if (!currentClient) {
            return "idle";
        }

        switch (currentClient.statusId) {
            case 3:
                return "called";

            case 4:
                return "accepted";

            case 6:
                return "redirected";

            case 1:
            default:
                return "idle";
        }
    };

    const computedStatus = getComputedStatus();


    useEffect(() => {
        console.log("🛠 Установка слушателя ManagerQueueSnapshot");

        const handleManagerQueueSnapshot = async (
            data: ManagerSnapshotData
        ) => {
            const knownTicketNumbers = previousQueueRef.current;

            const newClients = (data.queue ?? []).filter(
                (item) =>
                    !knownTicketNumbers.includes(item.ticketNumber)
            );

            if (newClients.length === 0) {
                return;
            }

            console.log(
                "🆕 SignalR сообщил о новой заявке:",
                newClients
            );

            previousQueueRef.current = Array.from(
                new Set([
                    ...knownTicketNumbers,
                    ...data.queue.map((item) => item.ticketNumber),
                ])
            );

            await playNewRequestNotification();

            // Получаем настоящие данные только через GET
            await fetchManagerRecords();
        };

        connection.on(
            "ManagerQueueSnapshot",
            handleManagerQueueSnapshot
        );

        return () => {
            connection.off(
                "ManagerQueueSnapshot",
                handleManagerQueueSnapshot
            );
        };
    }, [playNewRequestNotification, fetchManagerRecords]);

    useEffect(() => {
        if (!token || !isInitialDataLoaded) {
            return;
        }

        let isMounted = true;

        const initAndRegister = async () => {
            if (hasRegistered.current) return;

            console.log("🔄 [QueuePage] Starting SignalR connection...");

            let connectionId = await startSignalR();
            let attempts = 0;

            while (!connectionId && attempts < 10 && isMounted) {
                console.log(
                    `⏳ [QueuePage] Waiting for connectionId... Attempt ${
                        attempts + 1
                    }`
                );

                await new Promise((resolve) => setTimeout(resolve, 500));

                if (
                    connection.state === "Connected" &&
                    connection.connectionId
                ) {
                    connectionId = connection.connectionId;
                } else {
                    connectionId = await startSignalR();
                }

                attempts++;
            }

            if (connectionId && isMounted) {
                console.log(
                    "✅ [QueuePage] Connection ID obtained:",
                    connectionId
                );

                try {
                    await registerManager({
                        connectionId,
                    }).unwrap();

                    await startWindow({}).unwrap();

                    hasRegistered.current = true;

                    console.log(
                        "✅ Менеджер успешно зарегистрирован в SignalR с Connection ID:",
                        connectionId
                    );
                } catch (err: any) {
                    console.error(
                        "🔥 Ошибка при вызове registerManager:",
                        err
                    );

                     if (err?.status === 401 || err?.status === 403) {
                        handleLogout();
                        return;
                    }

                    if (err?.status === 503) {
                        window.location.reload();
                        return;
                    }
                }
            } else {
                console.warn(
                    "⚠️ Не удалось получить ID после нескольких попыток."
                );
            }
        };

        initAndRegister();

        return () => {
            isMounted = false;
        };
    }, [
        token,
        isInitialDataLoaded,
        registerManager,
        startWindow,
    ]);

    const handleAcceptClient = async () => {
        try {
            await acceptClient({}).unwrap();

            // Получаем новый statusId через GET
            await fetchManagerRecords();

            setSnackbar({
                open: true,
                message: t("i18n_queue.clientAccepted"),
                severity: "success",
            });
        } catch (err: any) {
            if (err?.status === 401 || err?.status === 403) {
                handleLogout();
                return;
            }

            console.error("Ошибка принятия клиента:", err);

            setSnackbar({
                open: true,
                message: "Ошибка принятия клиента",
                severity: "error",
            });
        }
    };

    const handleRedirectClient = async (
        serviceIdRedirect: string
    ) => {
        console.log(
            "Клиент перенаправлен на услугу:",
            serviceIdRedirect
        );

        // API перенаправления уже вызывается внутри RedirectModal.
        // Здесь только загружаем актуальные записи.
        await fetchManagerRecords();

        setSnackbar({
            open: true,
            message: t("i18n_queue.clientRedirected"),
            severity: "success",
        });
    };

    const handleCallNextClient = async () => {
        if (!snapshot?.queue?.length) {
            setSnackbar({
                open: true,
                message: t("i18n_queue.emptyQueue"),
                severity: "warning",
            });
            return;
        }

        try {
            await callNext({}).unwrap();

            // После изменения статуса заново получаем записи через GET
            await fetchManagerRecords();

            setSnackbar({
                open: true,
                message: t("i18n_queue.startQueue"),
                severity: "success",
            });
        } catch (err: any) {
            if (err?.status === 401 || err?.status === 403) {
                handleLogout();
                return;
            }

            if (err?.status === 503) {
                window.location.reload();
                return;
            }

            console.error("Ошибка вызова клиента:", err);

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

            // Убираем обслуженного клиента и показываем следующего
            await fetchManagerRecords();

            setSnackbar({
                open: true,
                message: t("i18n_queue.serviceCompleted"),
                severity: "success",
            });
        } catch (err: any) {
            if (err?.status === 401 || err?.status === 403) {
                handleLogout();
                return;
            }

            console.error("Ошибка завершения обслуживания:", err);

            setSnackbar({
                open: true,
                message: "Ошибка завершения обслуживания",
                severity: "error",
            });
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

    const handleRefreshQueue = async () => {
        try {
            await refreshQueueManagerDB().unwrap();

            console.log("✅ RefreshQueueManagerDB успешно вызван");

            setSnackbar({
                open: true,
                message: "Очередь обновлена",
                severity: "success",
            });

            setTimeout(() => {
                window.location.reload();
            }, 400);
        } catch (err) {
            console.error("❌ Ошибка RefreshQueueManagerDB:", err);

            setSnackbar({
                open: true,
                message: "Ошибка обновления очереди",
                severity: "error",
            });
        }
    };

    const uniqueQueue = React.useMemo(() => {
        if (!snapshot?.queue) return [];

        const uniqueItems = snapshot.queue.filter(
            (client, index, self) =>
                index ===
                self.findIndex(
                    (item) => item.ticketNumber === client.ticketNumber
                )
        );

        return [...uniqueItems].sort((a, b) => {
            const aTime = a.createdOn
                ? new Date(a.createdOn).getTime()
                : NaN;

            const bTime = b.createdOn
                ? new Date(b.createdOn).getTime()
                : NaN;

            const aHasValidDate = Number.isFinite(aTime);
            const bHasValidDate = Number.isFinite(bTime);

            if (aHasValidDate && bHasValidDate && aTime !== bTime) {
                return aTime - bTime;
            }

            if (aHasValidDate && !bHasValidDate) {
                return -1;
            }

            if (!aHasValidDate && bHasValidDate) {
                return 1;
            }

            return a.ticketNumber - b.ticketNumber;
        });
    }, [snapshot]);

    const displayClientObj =
        computedStatus !== "idle" &&
        snapshot?.activeClient &&
        snapshot.activeClient.ticketNumber !== -1
            ? snapshot.activeClient
            : uniqueQueue[0];

    const formattedClientData = displayClientObj
        ? {
            clientNumber: `${displayClientObj.ticketNumber}`,
            lastName: displayClientObj.lastName?.trim() || "-",
            firstName: displayClientObj.firstName?.trim() || "-",
            patronymic: displayClientObj.surName?.trim() || "-",
            service: getServiceName(
                displayClientObj,
                currentLanguage
            ),
            iin: displayClientObj.iin?.trim() || "-",
            createdOn: displayClientObj.createdOn,
        }
        : {
            ...defaultClientData,
            createdOn: undefined,
        };

    return (
        <>
            <Box sx={{ position: "fixed", bottom: 16, left: 16 }}>
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert
                        severity={snackbar.severity}
                        onClose={() =>
                            setSnackbar({ ...snackbar, open: false })
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
                    justifyContent: "flex-end",
                    alignItems: "center",
                    width: '100%',
                    maxWidth: 1128,
                    gap: 2,
                    mb: 3,
                }}
            >
                <Button
                    onClick={() => window.open(`${window.location.origin}/monitor`, "_blank")}
                    startIcon={
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M4 5.5C4 4.67 4.67 4 5.5 4H18.5C19.33 4 20 4.67 20 5.5V14.5C20 15.33 19.33 16 18.5 16H5.5C4.67 16 4 15.33 4 14.5V5.5Z"
                                stroke="#2F65B8"
                                strokeWidth="2"
                            />
                            <path
                                d="M9 20H15"
                                stroke="#2F65B8"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                            <path
                                d="M12 16V20"
                                stroke="#2F65B8"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    }
                    sx={{
                        height: 56,
                        px: 3,
                        borderRadius: "14px",
                        backgroundColor: "#fff",
                        color: "#1F2937",
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: 15,
                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                        border: "1px solid #EEF0F4",
                        "&:hover": {
                            backgroundColor: "#F9FAFB",
                            boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                        },
                    }}
                >
                    Монитор
                </Button>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                    }}
                >
                    <Button
                        variant="contained"
                        onClick={handleRefreshQueue}
                        startIcon={
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M20 12C20 16.42 16.42 20 12 20C8.72 20 5.9 18.03 4.67 15.21"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M4 12C4 7.58 7.58 4 12 4C15.28 4 18.1 5.97 19.33 8.79"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M20 5V9H16"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M4 19V15H8"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        }
                        sx={{
                            height: 56,
                            px: 3,
                            borderRadius: "14px",
                            backgroundColor: "#2F65B8",
                            color: "#fff",
                            textTransform: "none",
                            fontWeight: 700,
                            fontSize: 16,
                            boxShadow: "0 6px 18px rgba(47,101,184,.28)",
                            "&:hover": {
                                backgroundColor: "#2859A4",
                                boxShadow: "0 8px 22px rgba(47,101,184,.35)",
                            },
                        }}
                    >
                        Обновить
                    </Button>
                </Box>
            </Box>

            <StatusCardWrapper>
                <StatusCard
                    variant="accepted"
                    number={snapshot?.stats.serviced || 0}
                />
                <StatusCard
                    variant="not_accepted"
                    number={snapshot?.stats.rejected || 0}
                />
                <StatusCard
                    variant="redirected"
                    number={snapshot?.stats.redirected || 0}
                />
                <StatusCard
                    variant="in_anticipation"
                    number={snapshot?.stats.inLine || 0}
                />
            </StatusCardWrapper>

            <ClientCard
                clientData={formattedClientData}
                serviceTime={
                    displayClientObj
                        ? String(displayClientObj.averageExecutionTime)
                        : serviceTime1
                }
                onRedirect={handleRedirectClient}
                onAccept={handleAcceptClient}
                callNext={handleCallNextClient}
                onComplete={handleСompleteClient}
                status={computedStatus}
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
                        const item = uniqueQueue[index + 1];

                        return item ? (
                            <QueueCard
                                key={item.clientNumber}
                                clientNumber={item.ticketNumber}
                                service={getServiceName(item, currentLanguage)}
                                bookingTime={new Date(
                                    item.createdOn ?? ""
                                ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                                expectedTime={
                                    item.expectedAcceptanceTime
                                        ? new Date(
                                              item.expectedAcceptanceTime
                                          ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                          })
                                        : "-"
                                }
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
        </>
    );
};

export default QueuePage;