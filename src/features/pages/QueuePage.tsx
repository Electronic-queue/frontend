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
    useCompleteClientMutation,
    useGetRecordListByManagerQuery,
    useGetServiceByIdQuery,
} from "src/store/managerApi";

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
    const [callNext] = useCallNextMutation();
    const [completeClient] = useCompleteClientMutation();
    const [status, setStatus] = useState<"idle" | "called" | "accepted">(
        "idle"
    );
    const managerId: number = 6;

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
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [listOfClientsData, refetchClients]);
    useEffect(() => {
        const savedStatus = sessionStorage.getItem("clientStatus");
        if (savedStatus) {
            setStatus(savedStatus as "idle" | "called" | "accepted");
        }
    }, []);
    const firstClient = listOfClientsData?.[0] || null;
    const serviceId = firstClient?.serviceId;

    const {
        data: serviceData,
        error: serviceError,
        isLoading: isServiceLoading,
    } = useGetServiceByIdQuery(serviceId ?? 0, { skip: !serviceId });

    const handleAcceptClient = async () => {
        try {
            await acceptClient({ managerId }).unwrap();
            alert("Клиент принят!");
            setStatus("accepted");
            sessionStorage.setItem("clientStatus", "accepted");
        } catch (err) {}
    };

    const handleCallNextClient = async () => {
        try {
            await callNext({ managerId }).unwrap();
            alert("Первый клиент принят!");
            setStatus("called");
            sessionStorage.setItem("clientStatus", "called");
            refetchClients();
        } catch (err) {}
    };

    const handleСompleteClient = async () => {
        try {
            await completeClient({ managerId }).unwrap();
            refetchClients();
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
                <StatusCard variant="in_anticipation" number={8} />
            </StatusCardWrapper>

            {isListOfClientsLoading ? (
                <p>Загрузка...</p>
            ) : listOfClientsError ? (
                <p>
                    {"status" in listOfClientsError &&
                    listOfClientsError.status === 404 ? (
                        <ClientCard
                            clientData={clientData1}
                            serviceTime={serviceTime1}
                            onRedirect={handleRedirect}
                            onAccept={handleAcceptClient}
                            callNext={handleCallNextClient}
                            onComplete={handleСompleteClient}
                            status={status}
                        />
                    ) : (
                        "Ошибка загрузки данных"
                    )}
                </p>
            ) : firstClient ? (
                <ClientCard
                    clientData={clientData!}
                    serviceTime={serviceTime}
                    onRedirect={handleRedirect}
                    onAccept={handleAcceptClient}
                    callNext={handleCallNextClient}
                    onComplete={handleСompleteClient}
                    status={status} // Передаем статус
                />
            ) : (
                <ClientCard
                    clientData={clientData1}
                    serviceTime={serviceTime}
                    onRedirect={handleRedirect}
                    onAccept={handleAcceptClient}
                    callNext={handleCallNextClient}
                    onComplete={handleСompleteClient}
                    status={status}
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
                title="Остановка окна"
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
                        Поставить окно на паузу
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
