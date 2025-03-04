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
    useGetServiceListQuery,
    usePauseWindowMutation,
} from "src/store/managerApi";
import { Alert, Snackbar } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";

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
    const [selectedServiceId, setSelectedServiceId] = useState(null);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
    }>({ open: false, message: "" });

    const [status, setStatus] = useState<StatusType>("idle");
    const [isCallingNext, setIsCallingNext] = useState(false);
    const managerId: number = 6;
    const serviceIdRedirect: number = 3;

    const {
        data: listOfClientsData = [],
        error: listOfClientsError,
        isLoading: isListOfClientsLoading,
        refetch: refetchClients,
    } = useGetRecordListByManagerQuery();

    useEffect(() => {
        if (listOfClientsData.length === 0) {
            const interval = setInterval(() => {
                refetchClients();
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [listOfClientsData, refetchClients]);
    useEffect(() => {
        const savedStatus = sessionStorage.getItem("clientStatus");
        if (savedStatus) {
            setStatus(
                savedStatus as "idle" | "called" | "accepted" | "redirected"
            );
        }
    }, []);
    const firstClient = listOfClientsData?.[0] || null;
    const serviceId = firstClient?.serviceId;

    const {
        data: serviceData,
        error: serviceError,
        isLoading: isServiceLoading,
    } = useGetServiceByIdQuery(serviceId ?? 0, { skip: !serviceId });
    useEffect(() => {
        if (listOfClientsData.length === 0) {
            setStatus("idle");
            sessionStorage.removeItem("clientStatus");
        }
    }, [listOfClientsData]);

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
            console.error("Ошибка при постановке на паузу:", error);
            setSnackbar({
                open: true,
                message: t("i18n_queue.pauseError"),
            });
        }
    };

    const handleAcceptClient = async () => {
        try {
            await acceptClient({ managerId }).unwrap();
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

            if (listOfClientsData.length > 1) {
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
        setIsCallingNext(true);
        try {
            await callNext({ managerId }).unwrap();
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

            if (listOfClientsData.length > 1) {
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
    const handleRedirect = () => alert("Клиент перенаправлен");
    const handlePauseModalOpen = () => setIsPauseModalOpen(true);
    const handlePauseModalClose = () => setIsPauseModalOpen(false);
    const handleTimerModalOpen = () => {
        setIsPauseModalOpen(false);
        setIsTimerModalOpen(true);
    };
    const handleTimerModalClose = () => setIsTimerModalOpen(false);

    const handleTimeSelect = (time: number) => {
        setSelectedTime(time);
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
                    onClick={() => setIsPauseModalOpen(true)}
                >
                    {t("i18n_queue.pause")}
                </CustomButton>
            </ButtonWrapper>

            <StatusCardWrapper>
                <StatusCard variant="accepted" number={75} />
                <StatusCard variant="not_accepted" number={3} />
                <StatusCard variant="redirected" number={5} />
                <StatusCard
                    variant="in_anticipation"
                    number={listOfClientsData.length}
                />
            </StatusCardWrapper>

            {isListOfClientsLoading ? (
                <SkeletonStyles>
                    <Skeleton variant="rectangular" width={210} height={118} />
                    <Skeleton variant="rectangular" width={250} height={118} />
                </SkeletonStyles>
            ) : listOfClientsError ? (
                <>
                    {"status" in listOfClientsError &&
                    listOfClientsError.status === 404 ? (
                        <ClientCard
                            clientData={clientData1}
                            serviceTime={serviceTime1}
                            onRedirect={handleRedirectClient}
                            onAccept={handleAcceptClient}
                            callNext={handleCallNextClient}
                            onComplete={handleСompleteClient}
                            status={status}
                            loading={isCallingNext}
                        />
                    ) : (
                        "Ошибка загрузки данных"
                    )}
                </>
            ) : firstClient ? (
                <ClientCard
                    clientData={clientData!}
                    serviceTime={serviceTime}
                    onRedirect={handleRedirectClient}
                    onAccept={handleAcceptClient}
                    callNext={handleCallNextClient}
                    onComplete={handleСompleteClient}
                    status={status}
                    loading={isCallingNext}
                />
            ) : (
                <ClientCard
                    clientData={clientData1}
                    serviceTime={serviceTime}
                    onRedirect={handleRedirectClient}
                    onAccept={handleAcceptClient}
                    callNext={handleCallNextClient}
                    onComplete={handleСompleteClient}
                    status={status}
                    loading={isCallingNext}
                />
            )}

            <Box
                sx={{
                    display: "flex",
                    gap: 3,
                    paddingBottom: theme.spacing(3),
                }}
            >
                {Array.isArray(listOfClientsData) &&
                listOfClientsData.length > 1 ? (
                    listOfClientsData.slice(1, 5).map((item) => (
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
                        }}
                    >
                        {t("i18n_queue.pauseWindow")}
                    </CustomButton>
                </Box>
            </ReusableModal>

            <ReusableModal
                open={isTimerModalOpen}
                onClose={() => setIsTimerModalOpen(false)}
                title="Окно на паузе"
                width={theme.spacing(99)}
                showCloseButton={false}
                ignoreBackdropClick={true}
            >
                <Timer
                    initialTime={selectedTime}
                    onResume={() => setIsTimerModalOpen(false)}
                />
            </ReusableModal>
        </>
    );
};

export default QueuePage;
