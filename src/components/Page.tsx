import { PropsWithChildren } from "react";
import { styled } from "@mui/material/styles";
import Stack from "@mui/material/Stack";

export interface IPageProps {
    fullHeight?: boolean;
}

const PageContainer = styled(Stack)(({ theme }) => ({
    margin: "0 auto",
    padding: theme.spacing(3),
    height: "calc(100vh - 85.5px)",
    alignItems: "flex-start",
    maxWidth: "1200px",
}));

const Page = ({ children }: PropsWithChildren<IPageProps>) => (
    <PageContainer spacing={3}>{children}</PageContainer>
);

export default Page;
