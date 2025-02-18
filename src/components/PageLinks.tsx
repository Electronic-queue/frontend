import { FC } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Typography } from "@mui/material";
import { styled } from "@mui/material";
import theme from "src/styles/theme";

const StyledLink = styled(RouterLink, {
    shouldForwardProp: (prop) => prop !== "isActive",
})(({ theme, isActive }: { theme: any; isActive: boolean }) => ({
    textDecoration: "none",
    color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
    "&:hover": {
        color: theme.palette.secondary.main,
    },
}));

interface IPageLink {
    to: string;
    label: string;
}

interface IPageLinksProps {
    link: IPageLink;
    onClick: (to: string) => void;
}

const PageLinks: FC<IPageLinksProps> = ({ link, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === link.to;

    return (
        <Typography
            variant="h6"
            onClick={() => onClick(link.to)}
            sx={{
                fontSize: theme.typography.h6.fontSize,
            }}
        >
            <StyledLink to={link.to} isActive={isActive} theme={undefined}>
                {link.label}
            </StyledLink>
        </Typography>
    );
};

export default PageLinks;
