import { FC, useContext, useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import { styled, useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import Badge from "@mui/material/Badge";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip"; // Добавил тултип
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast'; // Иконка Кофе
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { Typography, Box } from "@mui/material";

// Импорты компонентов паузы
import ReusableModal from "src/components/ModalPage";
import SelectTime from "src/widgets/selectTiem/ui/SelectTime";
import Timer from "src/widgets/timer/ui/Timer";

// Импорты логики и стора
import { logout } from "src/store/authSlice";
import { SULogo, SuLogoDark, UserLogo } from "src/assets";
import LanguageSwitcher from "src/components/LanguageSwitcher";
import { MediaContext } from "src/features/MediaProvider";
import connection from "src/features/signalR";
import { useGetManagerIdQuery, usePauseWindowMutation } from "src/store/managerApi";
import { ColorModeContext } from "src/features/ThemeContext";
import i18n from "src/i18n";
import { RootState } from "src/store/store";

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
    backgroundColor: theme.palette.background.paper,
    alignItems: "center",
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

const RightSection = styled(Stack)(({ theme }) => ({
    flexDirection: "row",
    gap: theme.spacing(2),
    justifyContent: "flex-end",
    alignItems: "center",
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

// Стили для модалки таймера, чтобы кнопки внутри выглядели нормально
const ButtonWrapper = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
    display: "flex",
    gap: theme.spacing(2),
    justifyContent: "center",
}));

const Header: FC = () => {
    const media = useContext(MediaContext);
    const isMobile = media?.isMobile;
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);
    
    // --- Логика Паузы ---
    const [selectedTime, setSelectedTime] = useState<number>(1);
    const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
    const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
    const [pauseWindow] = usePauseWindowMutation();
    // --------------------

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorEl);
    const [notifications, setNotifications] = useState<string[]>([]);
    const [notificationsManager, setNotificationsManager] = useState<string[]>([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    
    // Получаем ID менеджера
    const { data: managerIdData } = useGetManagerIdQuery() as {
        data?: string | undefined;
    };

    // --- Обработчик Паузы ---
    const handlePauseClick = () => {
        setIsPauseModalOpen(true);
        setSelectedTime(1);
    };

    const handleConfirmPause = async () => {
        if (!managerIdData) return;
        try {
            await pauseWindow({
                managerId: Number(managerIdData), // Приводим к числу, если API требует число
                exceedingTime: selectedTime,
            }).unwrap();
            setIsPauseModalOpen(false);
            setIsTimerModalOpen(true);
            setSnackbarMessage(t("i18n_queue.windowPaused"));
            setOpenSnackbar(true);
        } catch (error) {
            console.error("Error while pausing:", error);
            setSnackbarMessage(t("i18n_queue.pauseError"));
            setOpenSnackbar(true);
        }
    };
    // ------------------------

    useEffect(() => {
        connection.on("SendToClients", (notificationToClients) => {
            if (notificationToClients) {
                setNotifications((prev) => [...prev, notificationToClients.contentRu]);
            }
        });

        connection.on("SendToClientsOnlyWn", (SendToClientsOnlyWn) => {
            if (SendToClientsOnlyWn) {
                setNotifications((prev) => [...prev, SendToClientsOnlyWn.contentRu]);
            }
        });
        connection.on("SendToManagers", (SendToManagers) => {
            if (SendToManagers) {
                setNotificationsManager((prev) => [...prev, SendToManagers.contentRu]);
            }
        });
        connection.on("SendToManagersOnlyWN", (SendToManagersOnlyWN) => {
            if (SendToManagersOnlyWN.managerId === managerIdData) {
                setNotificationsManager((prev) => [...prev, SendToManagersOnlyWN.contentRu]);
            }
        });

        return () => {
            connection.off("SendToClientsOnlyWn");
            connection.off("SendToClients");
            connection.off("SendToManagers");
            connection.off("SendToManagersOnlyWN");
        };
    }, [managerIdData]);

    const handleNotificationClick = () => {
        if (notifications.length > 0) {
            const message = notifications[0] || t("i18n_queue.notificationsIsEmpty");
            setSnackbarMessage(message);
            setNotifications((prev) => prev.slice(1));
        } else {
            setSnackbarMessage(t("i18n_queue.notificationsIsEmpty"));
        }
        setOpenSnackbar(true);
    };

    const handleNotificationManagerClick = () => {
        if (notificationsManager.length > 0) {
            const message = notificationsManager[0] || t("i18n_queue.notificationsIsEmpty");
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

    return (
        <HeaderContainer
            direction={isMobile ? "row-reverse" : "row"}
            justifyContent="space-between"
        >
            {!isMobile && (
                <Stack justifyContent="flex-start">
                    {theme.palette.mode === "dark" ? <SuLogoDark /> : <SULogo />}
                </Stack>
            )}
            
            <RightSection>
                {/* --- КНОПКА ПАУЗЫ (КОФЕ) --- */}
                {isAuthenticated && !isMobile && (
                     <Tooltip title={t("i18n_queue.pause") || "Pause"}>
                        <IconButton 
                            onClick={handlePauseClick} 
                            color="primary" // Можно 'default' или 'inherit'
                            sx={{ 
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: "12px",
                                padding: "8px"
                            }}
                        >
                            <FreeBreakfastIcon sx={{ color: theme.palette.indigoBlue.main }} />
                        </IconButton>
                    </Tooltip>
                )}
                
                <LanguageSwitcher />

                {!isMobile ? (
                    <>
                        <NotificationBadge
                            badgeContent={notificationsManager.length}
                            color="primary"
                        >
                            <IconButton onClick={handleNotificationManagerClick}>
                                <StyledNotificationCircle>
                                    <NotificationsNoneIcon />
                                </StyledNotificationCircle>
                            </IconButton>
                        </NotificationBadge>
                        
                        <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                            {theme.palette.mode === 'dark' ? <Brightness7Icon sx={{ color: "#3A6CB4", width: "30px", height: "40px" }} /> : <Brightness4Icon sx={{ color: "#3A6CB4" }} />}
                        </IconButton>
                        
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <IconButton onClick={handleMenuOpen}>
                                <UserLogo />
                            </IconButton>
                        </Box>
                        
                        <Menu
                            anchorEl={anchorEl}
                            open={isMenuOpen}
                            onClose={handleMenuClose}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                        >
                            {isAuthenticated ? (
                                <MenuItem onClick={handleLogout}>
                                    <LogoutIcon sx={{ marginRight: 1 }} />
                                    {t("i18n_queue.logOut")}
                                </MenuItem>
                            ) : (
                                <MenuItem onClick={() => { handleMenuClose(); navigate("/login"); }}>
                                    <LoginIcon sx={{ marginRight: 1 }} />
                                    {t("i18n_queue.logIn")}
                                </MenuItem>
                            )}
                        </Menu>
                    </>
                ) : (
                    <>
                        <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                            {theme.palette.mode === 'dark' ? <Brightness7Icon sx={{ color: "#3A6CB4", width: "30px", height: "40px" }} /> : <Brightness4Icon sx={{ color: "#3A6CB4" }} />}
                        </IconButton>
                        <NotificationBadge badgeContent={notifications.length} color="primary">
                            <IconButton onClick={handleNotificationClick}>
                                <StyledNotificationCircle>
                                    <NotificationsNoneIcon />
                                </StyledNotificationCircle>
                            </IconButton>
                        </NotificationBadge>
                    </>
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
                        "& .MuiAlert-message": { fontSize: "0.875rem" },
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* --- МОДАЛКИ ДЛЯ ПАУЗЫ (вынесены в конец) --- */}
            {isAuthenticated && (
                <>
                    <ReusableModal
                        open={isPauseModalOpen}
                        onClose={() => setIsPauseModalOpen(false)}
                        title={t("i18n_queue.stopWindow")}
                        width={theme.spacing(99)}
                        height={theme.spacing(35)} // чуть увеличил
                        showCloseButton={true}
                    >
                         <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                            <SelectTime onTimeSelect={(time) => setSelectedTime(time)} />
                            {/* Здесь нужна кнопка подтверждения, т.к. SelectTime обычно просто выбирает значение */}
                            {/* Используем обычную html кнопку или MUI Button, если CustomButton недоступен в хедере */}
                            <button 
                                onClick={handleConfirmPause}
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: theme.palette.indigoBlue.main,
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "16px"
                                }}
                            >
                                {t("i18n_queue.pauseWindow")}
                            </button>
                        </Box>
                    </ReusableModal>

                    <ReusableModal
                        open={isTimerModalOpen}
                        onClose={() => setIsTimerModalOpen(false)}
                        title={t("i18n_queue.windowPausedMessage")}
                        width={theme.spacing(99)}
                        showCloseButton={false}
                        ignoreBackdropClick={true}
                    >
                        <Timer
                            initialTime={selectedTime}
                            onResume={() => setIsTimerModalOpen(false)}
                            managerId={Number(managerIdData)}
                        />
                    </ReusableModal>
                </>
            )}
        </HeaderContainer>
    );
};

export default Header;