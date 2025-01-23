import { FC, useState } from "react";
import { styled, Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import CustomButton from "../../components/Button";
import StatusCard from "../../widgets/statusCard/ui/StatusCard";
import ClientCard from "../../widgets/clientCard/ui/ClientCard";
import QueueCard from "src/widgets/queueCard/ui/QueueCard";
import ReusableModal from "src/components/ModalPage";
import theme from "src/styles/theme";
import SelectTime from "src/widgets/selectTiem/ui/SelectTime";
import Timer from "src/widgets/timer/ui/Timer";
import { useGetRecordListByManagerQuery } from "src/store/managerApi";

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

const clientData = {
    clientNumber: "A21",
    lastName: "Каримов",
    firstName: "Айдархан",
    patronymic: "Нурсултанович",
    service: "Услуга 2",
    iin: "070501060888",
};

const handleRedirect = () => {
    console.log("Клиент перенаправлен");
};

const handleAccept = () => {
    console.log("Клиент принят");
};

const serviceTime = "03:00";

const QueuePage: FC = () => {
    const { t } = useTranslation();
    const [selectedTime, setSelectedTime] = useState<number>(1);
    const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
    const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);

    const { data, error, isLoading } = useGetRecordListByManagerQuery();

    if (isLoading) {
        console.log("Загрузка данных...");
    }

    if (error) {
        console.error("Ошибка при загрузке данных:", error);
    }

    if (data) {
        console.log("Ответ от API:", data);
    }

    const handlePauseModalOpen = () => setIsPauseModalOpen(true);
    const handlePauseModalClose = () => setIsPauseModalOpen(false);
    const handleTimerModalOpen = () => {
        setIsPauseModalOpen(false);
        setIsTimerModalOpen(true);
    };
    const handleTimerModalClose = () => setIsTimerModalOpen(false);

    const handleTimeSelect = (time: number) => {
        setSelectedTime(time);
        console.log("Выбранное время:", time);
    };

    return (
        <>
            <ButtonWrapper>
                <CustomButton
                    variantType="primary"
                    sizeType="medium"
                    onClick={handlePauseModalOpen}
                >
                    {t("queue.pause")}
                </CustomButton>
            </ButtonWrapper>

            <StatusCardWrapper>
                <StatusCard variant="accepted" number={75} />
                <StatusCard variant="not_accepted" number={3} />
                <StatusCard variant="redirected" number={5} />
                <StatusCard variant="in_anticipation" number={8} />
            </StatusCardWrapper>

            <ClientCard
                clientData={clientData}
                serviceTime={serviceTime}
                onRedirect={handleRedirect}
                onAccept={handleAccept}
            />

            <Box sx={{ display: "flex", gap: 3, paddingBottom: "222px" }}>
                <QueueCard
                    clientNumber="C34"
                    service="Услуга 5"
                    bookingTime="12:30"
                    expectedTime="12:45"
                />
                <QueueCard
                    clientNumber="C34"
                    service="Услуга 5"
                    bookingTime="12:30"
                    expectedTime="12:45"
                />
                <QueueCard
                    clientNumber="C34"
                    service="Услуга 5"
                    bookingTime="12:30"
                    expectedTime="12:45"
                />
                <QueueCard
                    clientNumber="C34"
                    service="Услуга 5"
                    bookingTime="12:30"
                    expectedTime="12:45"
                />
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
