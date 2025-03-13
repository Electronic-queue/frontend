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
    useGetServiceByIdQuery,
    usePauseWindowMutation,
    useGetManagerIdQuery,
} from "src/store/managerApi";
import { Alert, Snackbar } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import connection, { startSignalR } from "src/features/signalR";
import { set } from "react-hook-form";
type StatusType = "idle" | "called" | "accepted" | "redirected";

const ButtonWrapper = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    display: "flex",
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

const SkeletonStyles = styled(Box)(({ theme }) => ({
    width: "1128px",
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[3],
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
    const [redirectClient] = useRedirectClientMutation();
    const [callNext] = useCallNextMutation();
    const [completeClient] = useCompleteClientMutation();
    const [pauseWindow] = usePauseWindowMutation();
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
    }>({ open: false, message: "" });

    const [status, setStatus] = useState<StatusType>("idle");

    const managerId: number = 6;
    const [clientsSignalR, setClientsSignalR] = useState<any[]>([]);

    const {
        data: listOfClientsData = [],
        error: listOfClientsError,
        isLoading: isListOfClientsLoading,
        refetch: refetchClients,
    } = useGetRecordListByManagerQuery();
    useEffect(() => {
        refetchClients();
    }, []);

    useEffect(() => {
        console.log(
            "Сохранённый статус в sessionStorage:",
            sessionStorage.getItem("clientStatus")
        );
        const savedStatus = sessionStorage.getItem("clientStatus");
        if (savedStatus) {
            setStatus(savedStatus as StatusType);
        }
    }, []);

    const firstClient = clientsSignalR?.[0] || null;
    const serviceId = firstClient?.serviceId;

    const {
        data: serviceData,
        error: serviceError,
        isLoading: isServiceLoading,
    } = useGetServiceByIdQuery(serviceId ?? 0, { skip: !serviceId });
    const { data: managerIdData } = useGetManagerIdQuery() as {
        data?: string | undefined;
    };

    console.log("Converted Manager ID:", managerIdData);
    useEffect(() => {
        console.log("Обновляем статус:", status);
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
            console.log("clientListSignalR", clientListSignalR);
            console.log("fistName", clientListSignalR[0].firstName);
            setClientsSignalR(clientListSignalR);
        });
        connection.on("RecieveManagerStatic", (managerStatic) => {
            console.log("managerStatic", managerStatic);
        });
        return () => {
            connection.off("ClientListByManagerId");
        };
    }, []);

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
            });
        } catch (error) {
            console.error("Error while pausing the window:", error);
            setSnackbar({
                open: true,
                message: t("i18n_queue.pauseError"),
            });
        }
    };

    const handleAcceptClient = async () => {
        try {
            await acceptClient({}).unwrap();
            setSnackbar({
                open: true,
                message: t("i18n_queue.clientAccepted"),
            });

            setStatus("accepted");
            sessionStorage.setItem("clientStatus", "accepted");
        } catch (err) {}
    };

    const handleRedirectClient = async (serviceIdRedirect: number) => {
        try {
            await redirectClient({
                managerId,
                serviceId: serviceIdRedirect,
            }).unwrap();

            setSnackbar({
                open: true,
                message: t("i18n_queue.clientRedirected"),
            });

            refetchClients();

            if (clientsSignalR.length > 1) {
                setStatus("called");
                sessionStorage.setItem("clientStatus", "called");
            } else {
                setStatus("idle");
                sessionStorage.removeItem("clientStatus");
            }
        } catch (err) {
            console.error("Ошибка при перенаправлении клиента:", err);
        }
    };

    const handleCallNextClient = async () => {
        try {
            await callNext({}).unwrap();
            setSnackbar({ open: true, message: t("i18n_queue.startQueue") });

            setStatus("called");
            sessionStorage.setItem("clientStatus", "called");
            refetchClients();
        } catch (err) {}
    };

    const handleСompleteClient = async () => {
        try {
            await completeClient({ managerId }).unwrap();
            setSnackbar({
                open: true,
                message: t("i18n_queue.serviceCompleted"),
            });
            await refetchClients();

            if (clientsSignalR.length > 1) {
                setStatus("called");
                sessionStorage.setItem("clientStatus", "called");
            } else {
                setStatus("idle");
                sessionStorage.removeItem("clientStatus");
            }
        } catch (err) {}
    };

    const serviceName = isServiceLoading
        ? "Загрузка услуги..."
        : serviceError
          ? "Ошибка загрузки услуги"
          : serviceData?.value?.nameRu || "Неизвестная услуга";

    const clientData = firstClient
        ? {
              clientNumber: `${firstClient.recordId}`,
              lastName: firstClient.lastName,
              firstName: firstClient.firstName,
              patronymic: firstClient.surname || "",
              service: serviceName,
              iin: firstClient.iin,
          }
        : null;

    const serviceTime = serviceData?.value?.averageExecutionTime;

    const handlePauseModalOpen = () => {
        setIsPauseModalOpen(true);
        setSelectedTime(1);
    };

    return (
        <>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ open: false, message: "" })}
            >
                <Alert
                    severity="success"
                    onClose={() => setSnackbar({ open: false, message: "" })}
                    sx={{ fontSize: theme.typography.body1.fontSize }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <ButtonWrapper>
                <CustomButton
                    variantType="primary"
                    sizeType="medium"
                    onClick={() => handlePauseModalOpen()}
                >
                    {t("i18n_queue.pause")}
                </CustomButton>
            </ButtonWrapper>

            <StatusCardWrapper>
                <StatusCard variant="accepted" number={75} />
                <StatusCard variant="not_accepted" number={3} />
                <StatusCard variant="redirected" number={5} />
                <StatusCard variant="in_anticipation" number={2} />
            </StatusCardWrapper>

            <ClientCard
                clientData={firstClient ? clientData! : clientData1}
                serviceTime={firstClient ? serviceTime : serviceTime1}
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
                {Array.isArray(clientsSignalR) && clientsSignalR.length > 1 ? (
                    clientsSignalR.slice(1, 5).map((item) => (
                        <QueueCard
                            key={item.recordId}
                            clientNumber={item.recordId}
                            service={item.serviceNameRu}
                            bookingTime={new Date(
                                item.createdOn ?? ""
                            ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                            expectedTime={item.expectedAcceptanceTime}
                        />
                    ))
                ) : (
                    <p>Нет данных</p>
                )}
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
