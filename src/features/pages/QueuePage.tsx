import CustomButton from "../../components/Button";
import { FC } from "react";
import Page from "../../components/Page";
import { styled, Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import StatusCard from "../../components/StatusCard";
import CheckMarkIcon from "../../assets/CheckMarkIcon";
import CancelIcon from "../../assets/CancelIcon";
import ExclamationMarkIcon from "../../assets/ExclamationMarkIcon";
import LoadingIcon from "../../assets/LoadingIcon";

const CenteredWrapper = styled(Box)(({ theme }) => ({
    maxWidth: theme.spacing(150),
    margin: "0 auto",
    textAlign: "center",
}));

const ButtonWrapper = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    justifyContent: "flex-start",
    display: "flex",
    flexDirection: "row",
}));
const StatusCardWrapper = styled(Stack)(({ theme }) => ({
    display: "flex",
    flexDirection: "row",
    gap: theme.spacing(3),
    justifyContent: "center",
    height: "100vh",
    marginTop: theme.spacing(3),
}));

const QueuePage: FC = () => {
    const { t } = useTranslation("translation");
    return (
        <Page>
            <CenteredWrapper>
                <ButtonWrapper>
                    <CustomButton variantType="primary" sizeType="medium">
                        {t("queue.pause")}
                    </CustomButton>
                </ButtonWrapper>
                <StatusCardWrapper>
                    <StatusCard
                        icon={<CheckMarkIcon />}
                        text={t("status.accepted")}
                        number={75}
                    />
                    <StatusCard
                        icon={<CancelIcon />}
                        text={t("status.not_accepted")}
                        number={3}
                    />
                    <StatusCard
                        icon={<ExclamationMarkIcon />}
                        text={t("status.redirected")}
                        number={5}
                    />
                    <StatusCard
                        icon={<LoadingIcon />}
                        text={t("status.in_anticipation")}
                        number={8}
                    />
                </StatusCardWrapper>
            </CenteredWrapper>
        </Page>
    );
};

export default QueuePage;
