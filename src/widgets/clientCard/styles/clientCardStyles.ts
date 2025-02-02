import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const CardContainer = styled(Box)(({ theme }) => ({
    width: theme.spacing(140.5),
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
}));

export const ClientDetails = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
}));

export const ActionPanel = styled(Box)({
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-end",
});

export const TimeWrapper = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
}));

export const ClientInfoWrapper = styled(Box)(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing(5),
    width: "100%",
}));
