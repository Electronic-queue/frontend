import { PropsWithChildren } from "react";
import { styled } from "@mui/material/styles";
import Stack from "@mui/material/Stack";

const MobileContainer = styled(Stack)(({ theme }) => ({
    margin: "0 auto",
    padding: theme.spacing(2),
    height: "100dvh",
    maxWidth: "400px",
    alignItems: "stretch",
}));

const MobilePage = ({ children }: PropsWithChildren<{}>) => (
    <MobileContainer>{children}</MobileContainer>
);

export default MobilePage;
