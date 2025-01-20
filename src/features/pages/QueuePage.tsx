import CustomButton from "../../components/Button";
import { FC, useState } from "react";
import { styled, Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import StatusCard from "../../widgets/StatusCard";
import ClientCard from "../../widgets/clientCard/ui/ClientCard";
import QueueCard from "src/widgets/QueueCard";
import ReusableModal from "src/components/ModalPage";
import theme from "src/styles/theme";
import SelectTime from "src/widgets/selectTiem/ui/SelectTime";
const ButtonWrapper = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    justifyContent: "flex-start",
    display: "flex",
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
    const [isOpen, setIsOpen] = useState(false);
    const handleModalOpen = () => setIsOpen(true);
    const handleModalClose = () => setIsOpen(false);
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
                    onClick={handleModalOpen}
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
                <ReusableModal
                    open={isOpen}
                    onClose={handleModalClose}
                    title="Остоновка окна"
                    width={theme.spacing(99)}
                    showCloseButton={false}
                >
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <SelectTime onTimeSelect={handleTimeSelect} />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <CustomButton variantType="primary" sizeType="medium">
                            Поставить окно на паузу
                        </CustomButton>
                    </Box>
                </ReusableModal>
            </Box>
        </>
    );
};

export default QueuePage;
