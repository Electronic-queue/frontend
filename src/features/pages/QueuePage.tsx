import { FC, useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
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
} from "src/store/managerApi";
import { Alert, Snackbar } from "@mui/material";
import connection, { startSignalR } from "src/features/signalR";
import i18n from "src/i18n";
import { useRegisterManagerMutation } from "src/store/signalRManagerApi";
import { useSelector } from "react-redux";
import { RootState } from "src/store/store";
import React from "react";

type StatusType = "idle" | "called" | "accepted" | "redirected";

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
    marginTop: theme.spacing(3), // чуть подняли, т.к. убрали кнопки сверху
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
    const [acceptClient, { isLoading: isAccepting }] =
        useAcceptClientMutation();
    const currentLanguage = i18n.language || "ru";
    const [callNext, { isLoading: isCallingNext }] = useCallNextMutation();
    const [completeClient, { isLoading: isCompleting }] =
        useCompleteClientMutation();
    const [startWindow] = useStartWindowMutation();
    const [registerManager] = useRegisterManagerMutation();

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "warning" | "info";
    }>({ open: false, message: "", severity: "success" });

    const isActionLoading = isAccepting || isCallingNext || isCompleting;
    const token = useSelector((state: RootState) => state.auth.token);

    // Получаем ID из API, чтобы не хардкодить
    const { data: managerIdData } = useGetManagerIdQuery();
    const managerId = managerIdData ? Number(managerIdData) : 6;

    const [snapshot, setSnapshot] = useState<ManagerSnapshotData | null>(null);

    const getComputedStatus = (): StatusType => {
        const active = snapshot?.activeClient;
        if (!active) return "idle";
        if (active.statusId === 3) return "called";
        if (active.statusId === 4) return "accepted";
        return "idle";
    };

    const computedStatus = getComputedStatus();

    useEffect(() => {
        const setupSignalR = async () => {
            console.log("🛠 1. Установка слушателя ManagerQueueSnapshot");
            connection.on(
                "ManagerQueueSnapshot",
                (data: ManagerSnapshotData) => {
                    console.log("spanshot", data);
                    console.log(" socket: snapshot получено ✅", data);
                    setSnapshot(data);
                }
            );
        };
        setupSignalR();

        return () => {
            connection.off("ManagerQueueSnapshot");
        };
    }, []);

    const hasRegistered = useRef(false);

    useEffect(() => {
        if (!token) {
            console.error("❌ [QueuePage] No token available, skipping SignalR init");
            return;
        }

        let isMounted = true;

        const initAndRegister = async () => {
            if (hasRegistered.current) return;
            console.log("🔄 [QueuePage] Starting SignalR connection...");
            let connectionId = await startSignalR();
            let attempts = 0;
            while (!connectionId && attempts < 10 && isMounted) {
                console.log(`⏳ [QueuePage] Waiting for connectionId... Attempt ${attempts + 1}`);
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
                console.log("✅ [QueuePage] Connection ID obtained:", connectionId);
                console.log(
                    "✅ Получен Connection ID для менеджера:",
                    connectionId
                );
                try {
                    await registerManager({
                        connectionId: connectionId,
                    }).unwrap();
                    await startWindow({}).unwrap();
                    hasRegistered.current = true;
                    console.log(
                        "✅ Менеджер успешно зарегистрирован в SignalR с Connection ID:",
                        connectionId
                    );
                } catch (err: any) {
                    console.error("🔥 Ошибка при вызове registerManager:", err);
                    console.log("ошибка", err);
                    if (err?.status === 503) {
                        window.location.reload();
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
    }, [token, registerManager, startWindow]);

    const handleAcceptClient = async () => {
        try {
            await acceptClient({}).unwrap();
            setSnackbar({
                open: true,
                message: t("i18n_queue.clientAccepted"),
                severity: "success",
            });
        } catch (err) { }
    };

    const handleRedirectClient = () => {
        try {
            setSnackbar({
                open: true,
                message: t("i18n_queue.clientRedirected"),
                severity: "success",
            });
        } catch (err) { }
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
            setSnackbar({
                open: true,
                message: t("i18n_queue.startQueue"),
                severity: "success",
            });
        } catch (err: any) {
            if (err?.status === 503) {
                window.location.reload();
                return;
            }
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
        return snapshot.queue.filter(
            (client, index, self) =>
                index ===
                self.findIndex((t) => t.ticketNumber === client.ticketNumber)
        );
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
            lastName: displayClientObj.lastName || "-",
            firstName: displayClientObj.firstName || "-",
            patronymic: displayClientObj.surname || "-",
            service: getServiceName(displayClientObj, currentLanguage),
            iin: displayClientObj.iin || "-",
        }
        : defaultClientData;

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

            {/* Карточки статистики подняты выше */}
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
