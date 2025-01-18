import { FC } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Typography } from "@mui/material";
import { styled } from "@mui/material";

const StyledLink = styled(RouterLink)(
    ({ theme, isActive }: { theme: any; isActive: boolean }) => ({
        textDecoration: "none",
        color: isActive
            ? theme.palette.primary.main
            : theme.palette.text.primary,
        "&:hover": {
            color: theme.palette.secondary.main,
        },
    })
);

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
        <Typography //вместо этого использовать link from mui (component link from react-router-dom)
            variant="h6"
            onClick={() => onClick(link.to)}
            sx={{ fontSize: "16px", fontFamily: "Rubik, Arial, sans-serif" }}
        >
            <StyledLink to={link.to} isActive={isActive} theme={undefined}>
                {link.label}
            </StyledLink>
        </Typography>
    );
};

export default PageLinks;
