import { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useTranslation } from "react-i18next";

interface ClientCardProps {
    clientData: {
        clientNumber: string;
        lastName: string;
        firstName: string;
        patronymic: string;
        service: string;
        iin: string;
    };
    serviceTime: string;
    onRedirect: () => void;
    onAccept: () => void;
}

const CardContainer = styled(Box)(({ theme }) => ({
    width: theme.spacing(140.5),
    height: theme.spacing(40),
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
    gap: theme.spacing(1.5),
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

const LabelText = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    color: theme.palette.text.primary,
    fontSize: theme.typography.body1.fontSize,
}));

const ValueText = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
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
                        label: t("clientNumber"),
                        value: clientData.clientNumber,
                    },
                    { label: t("lastName"), value: clientData.lastName },
                    { label: t("firstName"), value: clientData.firstName },
                    { label: t("patronymic"), value: clientData.patronymic },
                    { label: t("service"), value: clientData.service },
                    { label: t("iin"), value: clientData.iin },
                ].map(({ label, value }, index) => (
                    <Box key={index} display="flex" gap={1}>
                        <LabelText>{label}:</LabelText>
                        <ValueText>{value}</ValueText>
                    </Box>
                ))}
            </ClientDetails>

            <ActionPanel>
                <TimeWrapper>
                    <AccessTimeIcon color="action" />
                    <Typography variant="body1" color="textSecondary">
                        {t("serviceTime")}: {serviceTime}
                    </Typography>
                </TimeWrapper>

                <Box display="flex" gap={2}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={onRedirect}
                    >
                        {t("redirect")}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onAccept}
                    >
                        {t("accept")}
                    </Button>
                </Box>
            </ActionPanel>
        </CardContainer>
    );
};

export default ClientCard;
