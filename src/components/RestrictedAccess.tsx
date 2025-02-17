import { FC } from "react";
import { styled } from "@mui/system";
import { PhoneIcon } from "src/assets";
import theme from "src/styles/theme";
import Stack from "@mui/material/Stack";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const Container = styled(Stack)({
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    height: "100vh",
    paddingLeft: "30%",
    width: "100%",
    maxWidth: "900px",
});

const Message = styled(Typography)({
    fontSize: theme.typography.h4.fontSize,
    fontWeight: "bold",
    textAlign: "center",
    color: theme.palette.text.primary,
});

const IconWrapper = styled(Stack)({
    width: "330px",
    height: "330px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing(2.5),
});

const RestrictedAccess: FC = () => {
    const { t } = useTranslation();
    return (
        <Container>
            <Message>{t("i18n_queue.mobileOnly")}</Message>
            <IconWrapper>
                <PhoneIcon width={330} height={330} />
            </IconWrapper>
        </Container>
    );
};

export default RestrictedAccess;
