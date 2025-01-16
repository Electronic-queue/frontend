import CustomButton from "../../components/Button";
import { FC } from "react";
import { styled, Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import StatusCard from "../../components/StatusCard";
import ClientCard from "../../components/ClientCard";
import QueueCard from "src/widgets/QueueCard";

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
    return (
        <>
            <ButtonWrapper>
                <CustomButton variantType="primary" sizeType="medium">
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
        </>
    );
};

export default QueuePage;
