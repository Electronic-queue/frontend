import { FC, useState } from "react";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import StatusButtons from "./StatusButtons";
import { ClientCardProps } from "../types/clientCardTypes";
import {
    CardContainer,
    ClientDetails,
    ActionPanel,
    TimeWrapper,
    ClientInfoWrapper,
} from "../styles/clientCardStyles";
import Typography from "@mui/material/Typography";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { styled } from "@mui/material/styles";

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
    onAccept,
    onComplete,
    callNext,
    status,
}) => {
    const { t } = useTranslation();

    return (
        <CardContainer>
            <ClientDetails>
                {[
                    {
                        label: t("i18n_queue.clientNumber"),
                        value: clientData.clientNumber,
                    },
                    {
                        label: t("i18n_queue.lastName"),
                        value: clientData.lastName,
                    },
                    {
                        label: t("i18n_queue.firstName"),
                        value: clientData.firstName,
                    },
                    {
                        label: t("i18n_queue.surname"),
                        value: clientData.patronymic,
                    },
                    {
                        label: t("i18n_queue.service"),
                        value: clientData.service,
                    },
                    {
                        label: t("i18n_queue.iin"),
                        value: clientData.iin,
                    },
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
                            {t("i18n_queue.serviceTime")}:
                        </Typography>
                        <Typography variant="h6" color="text">
                            {serviceTime} {t("i18n_queue.minut")}
                        </Typography>
                    </Box>
                </TimeWrapper>

                <StatusButtons
                    status={status}
                    callNext={callNext}
                    onAccept={onAccept}
                    onComplete={onComplete}
                />
            </ActionPanel>
        </CardContainer>
    );
};

export default ClientCard;
