import { PropsWithChildren } from "react";
import { styled } from "@mui/material/styles";
import Stack from "@mui/material/Stack";

const MobileContainer = styled(Stack)(({ theme }) => ({
    margin: "0 auto",
    maxWidth: "100%",
    alignItems: "stretch",
    "& > *": {
        width: "100%",
    },
}));

const MobilePage = ({ children }: PropsWithChildren<{}>) => (
    <MobileContainer>{children}</MobileContainer>
);

export default MobilePage;
