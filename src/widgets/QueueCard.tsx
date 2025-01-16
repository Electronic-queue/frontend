import { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

interface QueueCardProps {
    clientNumber: string;
    service: string;
    bookingTime: string;
    expectedTime: string;
}

const CardContainer = styled(Box)(({ theme }) => ({
    width: theme.spacing(33),
    height: theme.spacing(22),
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: "2px 4px 10px rgba(0, 0, 0, 0.25)",
    padding: theme.spacing(3),
}));

const Header = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const InfoBlock = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
}));

const QueueCard: FC<QueueCardProps> = ({
    clientNumber,
    service,
    bookingTime,
    expectedTime,
}) => {
    return (
        <CardContainer>
            <Header>
                <Typography variant="h6" fontWeight="bold">
                    № клиента
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                    {clientNumber}
                </Typography>
            </Header>
            <InfoBlock>
                <Box display="flex" justifyContent="space-between">
                    <Typography>Услуга</Typography>
                    <Typography fontWeight="bold">{service}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                    <Typography>Время записи</Typography>
                    <Typography fontWeight="bold">{bookingTime}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                    <Typography>Ожидаемое время приема</Typography>
                    <Typography fontWeight="bold">{expectedTime}</Typography>
                </Box>
            </InfoBlock>
        </CardContainer>
    );
};

export default QueueCard;
