import { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useTranslation } from "react-i18next";
import CustomButton from "./Button";

interface ClientCardProps {
    clientData: {
        clientNumber: string;
        lastName: string;
        firstName: string;
        patronymic?: string;
        service: string;
        iin: string;
    };
    serviceTime: string;
    onRedirect: () => void;
    onAccept: () => void;
}

const CardContainer = styled(Box)(({ theme }) => ({
    width: theme.spacing(140.5),
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: "2px 4px 10px rgba(0, 0, 0, 0.25)",
}));

const ClientDetails = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
}));

const ActionPanel = styled(Box)(({}) => ({
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-end",
}));

const TimeWrapper = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
}));

const ClientInfoWrapper = styled(Box)(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing(5),
    width: "100%",
}));

const LabelText = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    color: theme.palette.text.primary,
    fontSize: theme.typography.body1.fontSize,
    textAlign: "left",
}));

const ValueText = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body1.fontSize,
    textAlign: "left",
}));

const ClientCard: FC<ClientCardProps> = ({
    clientData,
    serviceTime,
    onRedirect,
    onAccept,
}) => {
    const { t } = useTranslation();

    return (
        <CardContainer>
            <ClientDetails>
                {[
                    {
                        label: t("queue.clientNumber"),
                        value: clientData.clientNumber,
                    },
                    { label: t("queue.lastName"), value: clientData.lastName },
                    {
                        label: t("queue.firstName"),
                        value: clientData.firstName,
                    },
                    { label: t("queue.surname"), value: clientData.patronymic },
                    { label: t("queue.service"), value: clientData.service },
                    { label: t("queue.iin"), value: clientData.iin },
                ].map(({ label, value }, index) => (
                    <ClientInfoWrapper key={index}>
                        <LabelText>{label}</LabelText>
                        <ValueText>{value}</ValueText>
                    </ClientInfoWrapper>
                ))}
            </ClientDetails>

            <ActionPanel>
                <TimeWrapper>
                    <AccessTimeIcon color="inherit" />
                    <Box display="flex" gap={1}>
                        <Typography variant="h6" color="text" fontWeight="bold">
                            {t("queue.serviceTime")}:
                        </Typography>
                        <Typography variant="h6" color="text">
                            {serviceTime}
                        </Typography>
                    </Box>
                </TimeWrapper>

                <Box display="flex" gap={2}>
                    <CustomButton
                        variantType="primary"
                        sizeType="small"
                        onClick={onRedirect}
                    >
                        {t("queue.redirect")}
                    </CustomButton>
                    <CustomButton
                        variantType="primary"
                        sizeType="small"
                        onClick={onAccept}
                    >
                        {t("queue.accept")}
                    </CustomButton>
                </Box>
            </ActionPanel>
        </CardContainer>
    );
};

export default ClientCard;
