import React, { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import CheckMarkIcon from "../assets/CheckMarkIcon";
import { CancelIcon } from "../assets";
import ExclamationMarkIcon from "src/assets/ExclamationMarkIcon";
import LoadingIcon from "../assets/LoadingIcon";

type StatusVariant =
    | "accepted"
    | "not_accepted"
    | "redirected"
    | "in_anticipation";

const STATUS_VARIANTS: Record<
    StatusVariant,
    { icon: React.ReactElement; text: string }
> = {
    accepted: {
        icon: <CheckMarkIcon />,
        text: "Принято",
    },
    not_accepted: {
        icon: <CancelIcon />,
        text: "Не принято",
    },
    redirected: {
        icon: <ExclamationMarkIcon />,
        text: "Перенаправлено",
    },
    in_anticipation: {
        icon: <LoadingIcon />,
        text: "В ожидании",
    },
};

interface StatusCardProps {
    variant: StatusVariant;
    number: number;
}

const CardContainer = styled(Box)(({ theme }) => ({
    width: theme.spacing(33),
    height: theme.spacing(11),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: "2px 4px 10px rgba(0, 0, 0, 0.25)",
}));

const IconAndTextWrapper = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
}));

const StatusCard: FC<StatusCardProps> = ({ variant, number }) => {
    const { icon, text } = STATUS_VARIANTS[variant];

    return (
        <CardContainer>
            <IconAndTextWrapper>
                {icon}
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {text}
                </Typography>
            </IconAndTextWrapper>
            <Typography
                variant="h4"
                color="primary"
                sx={{ fontWeight: "bold" }}
            >
                {number}
            </Typography>
        </CardContainer>
    );
};

export default StatusCard;
