import { FC } from "react";
import { styled } from "@mui/system";
import { PhoneIcon } from "src/assets";
import theme from "src/styles/theme";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const Container = styled("div")({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    paddingLeft: "30%",
});

const Message = styled(Typography)({
    fontSize: theme.typography.h4.fontSize,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
});

const RestrictedAccess: FC = () => {
    const { t } = useTranslation();
    return (
        <Container>
            <Message> {t("i18n_queue.mobileOnly")}</Message>
            <PhoneIcon />
        </Container>
    );
};

export default RestrictedAccess;
