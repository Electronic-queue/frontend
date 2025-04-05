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
import { Alert, Snackbar } from "@mui/material";
import connection, { startSignalR } from "src/features/signalR";
import i18n from "src/i18n";
type StatusType = "idle" | "called" | "accepted" | "redirected";
import { GrUpdate } from "react-icons/gr";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import LoopIcon from "@mui/icons-material/Loop";
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
    const [selectedTime, setSelectedTime] = useState<number>(1);
    const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
    const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
    const [acceptClient] = useAcceptClientMutation();
    const currentLanguage = i18n.language || "ru";
    const [callNext] = useCallNextMutation();
    const [completeClient] = useCompleteClientMutation();
    const [pauseWindow] = usePauseWindowMutation();
    const [cancelQueue] = useCancelQueueMutation();
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
            setStatus((prev) => (prev === "idle" ? "idle" : prev));
        }
    }, [clientsSignalR]);

    useEffect(() => {
        startSignalR();
        connection.on("ClientListByManagerId", (clientListSignalR) => {
            if (
                Array.isArray(clientListSignalR) &&
                clientListSignalR.length > 0
            ) {
                if (clientListSignalR[0].managerId == managerIdData) {
                    setClientsSignalR(clientListSignalR);
                }
            } else {
            }
        });

        connection.on("RecieveManagerStatic", (managerStatic) => {
            if (managerStatic.managerId === managerIdData) {
                setManagerStatic(managerStatic);
            }
        });

        return () => {
            connection.off("ClientListByManagerId");
            connection.off("RecieveManagerStatic");
        };
    }, [managerIdData]);

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
                        }}
                        sx={{
                            marginRight: theme.spacing(3),
                        }}
                    >
                        <LoopIcon />
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
        </>
    );
};

export default QueuePage;
