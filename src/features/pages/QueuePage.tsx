import CustomButton from "../../components/Button";
import { FC } from "react";
import Page from "../../components/Page";
import { styled, Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import StatusCard from "../../components/StatusCard";

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
                    <StatusCard variant="accepted" number={75} />
                    <StatusCard variant="not_accepted" number={3} />
                    <StatusCard variant="redirected" number={5} />
                    <StatusCard variant="in_anticipation" number={8} />
                </StatusCardWrapper>
            </CenteredWrapper>
        </Page>
    );
};

export default QueuePage;
