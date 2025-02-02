import { FC, useContext, useState } from "react";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import LogoutIcon from "@mui/icons-material/Logout";
import Badge from "@mui/material/Badge";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { logout } from "src/store/authSlice";
import PageLinks from "src/components/PageLinks";
import { SULogo } from "src/assets";
import { UserLogo } from "src/assets";
import LanguageSwitcher from "src/components/LanguageSwitcher";
import { MediaContext } from "src/features/MediaProvider";

const HeaderContainer = styled(Stack)(({ theme }) => ({
    width: "100%",
    backgroundColor: "white",
    alignItems: "center",
    borderBottom: "1px solid #F3F3FD",
    boxShadow: theme.shadows[2],
    flexDirection: "row",
    padding: `${theme.spacing(2)} ${theme.spacing(6)}`,
    [theme.breakpoints.down("sm")]: {
        padding: `${theme.spacing(2)} ${theme.spacing(1)}`,
        flexDirection: "row-reverse",
    },
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
        backgroundColor: theme.palette.indigoBlue.main,
        color: "white",
        fontSize: "0.7rem",
    },
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

const StyledNotificationCircle = styled(Stack)(({ theme }) => ({
    width: 40,
    height: 40,
    borderRadius: "50%",
    backgroundColor: theme.palette.indigoBlue.main,
    color: "white",
    alignItems: "center",
    justifyContent: "center",
}));

const Header: FC = () => {
    const media = useContext(MediaContext);
    const isMobile = media?.isMobile;
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorEl);
    const [notifications, setNotifications] = useState<string[]>([]);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const handleNotificationClick = () => {
        if (notifications.length > 0) {
            setSnackbarMessage(notifications[0]);
        } else {
            setSnackbarMessage("No notifications");
        }
        setOpenSnackbar(true);
    };

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };

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
        <HeaderContainer
            direction={isMobile ? "row-reverse" : "row"}
            justifyContent="space-between"
        >
            {!isMobile && (
                <Stack justifyContent="flex-start">
                    <SULogo />
                </Stack>
            )}
            {!isMobile && (
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
            )}

            <RightSection>
                <LanguageSwitcher />
                {!isMobile ? (
                    <>
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
                    </>
                ) : (
                    <NotificationBadge
                        badgeContent={notifications.length}
                        color="primary"
                    >
                        <IconButton onClick={handleNotificationClick}>
                            <StyledNotificationCircle>
                                {notifications.length}
                            </StyledNotificationCircle>
                        </IconButton>
                    </NotificationBadge>
                )}
            </RightSection>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity="info"
                    sx={{
                        width: "80%",
                        "& .MuiAlert-message": {
                            fontSize: "0.875rem",
                        },
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </HeaderContainer>
    );
};

export default Header;
