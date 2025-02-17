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
    alignItems: "center",
    height: "100vh",
    width: "100%",
});

const ContentWrapper = styled(Stack)({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: "600px",
    textAlign: "center",
    gap: theme.spacing(1),
});

const Message = styled(Typography)({
    fontSize: theme.typography.h4.fontSize,
    fontWeight: "bold",
    color: theme.palette.text.primary,
    width: "255px",
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
            <ContentWrapper>
                <Message>{t("i18n_queue.mobileOnly")}</Message>
                <IconWrapper>
                    <PhoneIcon width={330} height={330} />
                </IconWrapper>
            </ContentWrapper>
        </Container>
    );
};

export default RestrictedAccess;
