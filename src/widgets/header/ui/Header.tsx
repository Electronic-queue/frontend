import { FC, useContext, useEffect, useState } from "react";
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
import connection from "src/features/signalR";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { useGetManagerIdQuery } from "src/store/managerApi";
import i18n from "src/i18n";

type notificationsForManager = {
    contentEn: string;
    contentKk: string;
    contentRu: string;
    managerId: string;
    nameEn: string;
    nameRu: string;
    nameKk: string;
    notificationId: string;
    notificationTypeId: string;
    windowNumber: string;
};

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
    const [notificationsManager, setNotificationsManager] = useState<string[]>(
        []
    );
    const currentLanguage = i18n.language || "ru";

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const { data: managerIdData } = useGetManagerIdQuery() as {
        data?: string | undefined;
    };

    useEffect(() => {
        connection.on("SendToClients", (notificationToClients) => {
            if (notificationToClients) {
                setNotifications((prev) => [
                    ...prev,
                    notificationToClients.contentRu,
                ]);
            }
        });

        connection.on("SendToClientsOnlyWn", (SendToClientsOnlyWn) => {
            if (SendToClientsOnlyWn) {
                setNotifications((prev) => [
                    ...prev,
                    SendToClientsOnlyWn.contentRu,
                ]);
            }
        });
        connection.on("SendToManagers", (SendToManagers) => {
            if (SendToManagers) {
                setNotificationsManager((prev) => [
                    ...prev,
                    SendToManagers.contentRu,
                ]);
            }
        });
        connection.on("SendToManagersOnlyWN", (SendToManagersOnlyWN) => {
            console.log("SendToManagersOnlyWN", SendToManagersOnlyWN);
            if (SendToManagersOnlyWN.managerId === managerIdData) {
                setNotificationsManager((prev) => [
                    ...prev,
                    SendToManagersOnlyWN.contentRu,
                ]);
            }
        });

        return () => {
            connection.off("SendToClientsOnlyWn");
            connection.off("SendToClients");
            connection.off("SendToManagers");
            connection.off("SendToManagersOnlyWN");
        };
    }, []);

    const handleNotificationClick = () => {
        if (notifications.length > 0) {
            const message =
                notifications[0] || t("i18n_queue.notificationsIsEmpty");
            setSnackbarMessage(message);
            setNotifications((prev) => prev.slice(1));
        } else {
            setSnackbarMessage(t("i18n_queue.notificationsIsEmpty"));
        }
        setOpenSnackbar(true);
    };

    const handleNotificationManagerClick = () => {
        if (notificationsManager.length > 0) {
            const message =
                notificationsManager[0] || t("i18n_queue.notificationsIsEmpty");
            setSnackbarMessage(message);
            setNotificationsManager((prev) => prev.slice(1));
        } else {
            setSnackbarMessage(t("i18n_queue.notificationsIsEmpty"));
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

    const getNotificationName = (
        item: notificationsForManager,
        lang: string
    ) => {
        switch (lang) {
            case "en":
                return item.contentEn;
            case "kz":
                return item.contentKk;
            default:
                return item.contentRu;
        }
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
                    </LinksContainer>
                </Stack>
            )}

            <RightSection>
                <LanguageSwitcher />
                {!isMobile ? (
                    <>
                        <NotificationBadge
                            badgeContent={notificationsManager.length}
                            color="primary"
                        >
                            <IconButton
                                onClick={handleNotificationManagerClick}
                            >
                                <StyledNotificationCircle>
                                    <NotificationsNoneIcon />
                                </StyledNotificationCircle>
                            </IconButton>
                        </NotificationBadge>
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
                                {t("i18n_queue.logOut")}
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
                                <NotificationsNoneIcon />
                            </StyledNotificationCircle>
                        </IconButton>
                    </NotificationBadge>
                )}
            </RightSection>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity="info"
                    sx={{
                        width: "80",
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
