import CustomButton from "../../components/Button";
import StatusCards from "../../components/StatusCards";
import { FC } from "react";
import Page from "../../components/Page";
import { styled, Box } from "@mui/material";

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

const QueuePage: FC = () => {
    return (
        <Page>
            <CenteredWrapper>
                <ButtonWrapper>
                    <CustomButton variantType="primary">
                        Поставить окно на паузу
                    </CustomButton>
                </ButtonWrapper>
                <StatusCards />
            </CenteredWrapper>
        </Page>
    );
};

export default QueuePage;
