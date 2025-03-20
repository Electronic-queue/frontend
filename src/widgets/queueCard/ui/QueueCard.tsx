import { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { QueueCardProps } from "../types/queueCardTypes";

const CardContainer = styled(Box)(({ theme }) => ({
    width: theme.spacing(33),
    height: theme.spacing(22),
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[6],
    padding: theme.spacing(3),
}));

const Header = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(1),
}));

const InfoBlock = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
}));
const ServiceTypography = styled(Typography)(({}) => ({
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: 140,
    fontWeight: "bold",
    noWrap: true,
}));
const QueueCard: FC<QueueCardProps> = ({
    clientNumber,
    service,
    bookingTime,
    expectedTime,
}) => {
    const { t } = useTranslation();
    return (
        <CardContainer>
            <Header>
                <Typography variant="h6" fontWeight="bold">
                    {t("i18n_queue.clientNumber")}
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                    {clientNumber}
                </Typography>
            </Header>
            <InfoBlock>
                <Box display="flex" justifyContent="space-between">
                    <Typography>{t("i18n_queue.service")}</Typography>
                    <ServiceTypography>{service}</ServiceTypography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                    <Typography> {t("i18n_queue.rigistrationTime")}</Typography>
                    <Typography fontWeight="bold">{bookingTime}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                    <Typography>{t("i18n_queue.ExpectedTime")}</Typography>
                    <Typography fontWeight="bold">{expectedTime}</Typography>
                </Box>
            </InfoBlock>
        </CardContainer>
    );
};

export default QueueCard;
