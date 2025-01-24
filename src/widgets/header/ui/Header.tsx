import { FC, useState } from "react";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import LogoutIcon from "@mui/icons-material/Logout";
import { logout } from "src/store/authSlice";
import PageLinks from "src/components/PageLinks";
import { SULogo } from "src/assets";
import { UserLogo } from "src/assets";
import LanguageSwitcher from "src/components/LanguageSwitcher";

const HeaderContainer = styled(Stack)(({ theme }) => ({
    width: "100%",
    backgroundColor: "white",
    padding: `${theme.spacing(2)} ${theme.spacing(6)}`,
    alignItems: "center",
    borderBottom: "1px solid #F3F3FD",
    boxShadow: "0px 2px 7px rgba(0, 0, 0, 0.25)",
}));

const LinksContainer = styled(Stack)(({ theme }) => ({
    flexDirection: "row",
    gap: theme.spacing(5),
}));

const RightSection = styled(Stack)(({ theme }) => ({
    flexDirection: "row",
    gap: theme.spacing(2),
    justifyContent: "flex-end",
}));

const Header: FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");

        dispatch(logout());

        setAnchorEl(null);

        navigate("/login");
    };

    return (
        <HeaderContainer direction="row" justifyContent="space-between">
            <Stack justifyContent="flex-start">
                <SULogo />
            </Stack>

            <Stack direction="row" justifyContent="center" flexGrow={1}>
                <LinksContainer>
                    <PageLinks
                        onClick={() => navigate("/manager/queue")}
                        link={{
                            to: "/manager/queue",
                            label: t("I18N_QUEUE_MANAGEMENT"),
                        }}
                    />
                    <PageLinks
                        onClick={() => navigate("/manager/reports")}
                        link={{
                            to: "/manager/reports",
                            label: t("I18N_STATISTICS"),
                        }}
                    />
                </LinksContainer>
            </Stack>

            <RightSection>
                <LanguageSwitcher />

                <IconButton onClick={handleMenuOpen}>
                    <UserLogo />
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={isMenuOpen}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                >
                    <MenuItem onClick={handleLogout}>
                        <LogoutIcon sx={{ marginRight: 1 }} />
                        {t("I18N_LOGOUT")}
                    </MenuItem>
                </Menu>
            </RightSection>
        </HeaderContainer>
    );
};

export default Header;
