import React, { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import {
    CancelIcon,
    CheckMarkIcon,
    ExclamationMarkIcon,
    LoadingIcon,
} from "src/assets";
import { useTranslation } from "react-i18next";

type StatusVariant =
    | "accepted"
    | "not_accepted"
    | "redirected"
    | "in_anticipation";

const STATUS_VARIANTS: Record<
    StatusVariant,
    { icon: React.ReactElement; translationKey: string }
> = {
    accepted: {
        icon: <CheckMarkIcon />,
        translationKey: "status.accepted",
    },
    not_accepted: {
        icon: <CancelIcon />,
        translationKey: "status.not_accepted",
    },
    redirected: {
        icon: <ExclamationMarkIcon />,
        translationKey: "status.redirected",
    },
    in_anticipation: {
        icon: <LoadingIcon />,
        translationKey: "status.in_anticipation",
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
    const { t } = useTranslation();
    const { icon, translationKey } = STATUS_VARIANTS[variant];

    return (
        <CardContainer>
            <IconAndTextWrapper>
                {icon}
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {t(translationKey)}
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
