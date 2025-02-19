import { FC, useState } from "react";
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
    useGetRecordListByManagerQuery,
    useGetServiceByIdQuery,
} from "src/store/managerApi";
import useQueueData from "src/hooks/useQueueData";

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

const QueuePage: FC = () => {
    const { t } = useTranslation();
    const [selectedTime, setSelectedTime] = useState<number>(1);
    const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
    const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);

    const { data, error, isLoading } = useGetRecordListByManagerQuery();

    const firstClient = data?.length ? data[0] : null;
    const serviceId = firstClient?.serviceId;

    const {
        data: serviceData,
        error: serviceError,
        isLoading: isServiceLoading,
    } = useGetServiceByIdQuery(serviceId ?? 0, {
        skip: !serviceId,
    });

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

    const handleRedirect = () => {
        alert("Клиент перенаправлен");
    };

    const handleAccept = () => {
        alert("Клиент принят");
    };

    const handlePauseModalOpen = () => setIsPauseModalOpen(true);
    const handlePauseModalClose = () => setIsPauseModalOpen(false);
    const handleTimerModalOpen = () => {
        setIsPauseModalOpen(false);
        setIsTimerModalOpen(true);
    };
    const handleTimerModalClose = () => setIsTimerModalOpen(false);

    const handleTimeSelect = (time: number) => {
        setSelectedTime(time);
        alert(`Выбранное время: ${time}`);
    };

    const queueData = useQueueData();

    return (
        <>
            <ButtonWrapper>
                <CustomButton
                    variantType="primary"
                    sizeType="medium"
                    onClick={handlePauseModalOpen}
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

            {isLoading ? (
                <p>Загрузка...</p>
            ) : error ? (
                <p>Ошибка загрузки данных</p>
            ) : firstClient ? (
                <ClientCard
                    clientData={clientData!}
                    serviceTime={serviceTime}
                    onRedirect={handleRedirect}
                    onAccept={handleAccept}
                />
            ) : (
                <p>Нет данных</p>
            )}

            <Box
                sx={{
                    display: "flex",
                    gap: 3,
                    paddingBottom: theme.spacing(3),
                }}
            >
                {queueData.length > 0 ? (
                    queueData.map((item, index) => (
                        <QueueCard
                            key={index}
                            clientNumber={item.clientNumber}
                            service={item.service}
                            bookingTime={item.bookingTime}
                            expectedTime={item.expectedTime}
                        />
                    ))
                ) : (
                    <p>Загрузка...</p>
                )}
            </Box>

            <ReusableModal
                open={isPauseModalOpen}
                onClose={handlePauseModalClose}
                title="Остановка окна"
                width={theme.spacing(99)}
                showCloseButton={false}
            >
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <SelectTime onTimeSelect={handleTimeSelect} />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <CustomButton
                        variantType="primary"
                        sizeType="medium"
                        onClick={handleTimerModalOpen}
                    >
                        Поставить окно на паузу
                    </CustomButton>
                </Box>
            </ReusableModal>

            <ReusableModal
                open={isTimerModalOpen}
                onClose={handleTimerModalClose}
                title="Окно на паузе"
                width={theme.spacing(99)}
                showCloseButton={false}
                ignoreBackdropClick={true}
            >
                <Timer
                    initialTime={selectedTime}
                    onResume={handleTimerModalClose}
                />
            </ReusableModal>
        </>
    );
};

export default QueuePage;
