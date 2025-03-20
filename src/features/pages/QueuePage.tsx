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
} from "src/store/managerApi";
import { Alert, Snackbar } from "@mui/material";
import connection, { startSignalR } from "src/features/signalR";
import i18n from "src/i18n";
type StatusType = "idle" | "called" | "accepted" | "redirected";

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
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
    }>({ open: false, message: "" });

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
    console.log("signalR", clientsSignalR);
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
            console.log(clientListSignalR);
            if (clientListSignalR[0].managerId == managerIdData) {
                setClientsSignalR(clientListSignalR);
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

    const handleRedirectClient = () => {
        try {
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
                {Array.isArray(clientsSignalR) && clientsSignalR.length > 1
                    ? clientsSignalR.slice(1, 5).map((item) => (
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
                      ))
                    : Array(4)
                          .fill(null)
                          .map((_, index) => (
                              <QueueCard
                                  key={index}
                                  clientNumber={0}
                                  service="-"
                                  bookingTime="-"
                                  expectedTime="-"
                              />
                          ))}
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
