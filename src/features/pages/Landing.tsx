// src/features/pages/Landing.tsx
import { Typography } from "@mui/material";
import Stack from "@mui/material/Stack";
import { styled, useTheme } from "@mui/material/styles"; // Добавлен useTheme
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import { StudentsIcon, SULogoM, SULogoMDark } from "src/assets"; // Добавлен SULogoMDark
import { useDispatch } from "react-redux";
import { setQueueTypeId } from "src/store/userAuthSlice";
// УДАЛЕНО: import theme from "src/styles/theme"; 
import { useNavigate } from "react-router-dom";
import { useGetQueueTypeQuery } from "src/store/managerApi";
import CustomButton from "src/components/Button";
import i18n from "src/i18n";

// Исправляем фон страницы
const BackgroundContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    // ЛОГИКА: Если светлая тема -> градиент, если темная -> цвет фона по умолчанию
    background: theme.palette.mode === 'light' 
        ? "linear-gradient(to left, #ADD8E6, white 50%)" 
        : theme.palette.background.default, 
    paddingTop: theme.spacing(-5),
    // Убедимся, что фон занимает всю высоту экрана
    width: "100%"
}));

const FormContainer = styled(Stack)(({ theme }) => ({
    position: "relative",
    width: "95%",
    height: "565px",
    maxWidth: theme.spacing(50),
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[2],
    overflow: "hidden",
    zIndex: 1,
}));

// Исправляем "прозрачную" карточку
const BlurBackground = styled(Box)(({ theme }) => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.spacing(2),
    // ЛОГИКА: Светлая тема -> белая прозрачность. Темная тема -> черная/темная прозрачность.
    backgroundColor: theme.palette.mode === 'light'
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(30, 30, 30, 0.6)", // Затемняем карточку в ночном режиме
    border: theme.palette.mode === 'light'
        ? "1px solid rgba(36, 34, 207, 0.18)"
        : "1px solid rgba(255, 255, 255, 0.1)", // Светлая граница для контраста в темноте
    backdropFilter: "blur(8px)",
    zIndex: 0,
}));

const Landing = () => {
    // 1. Получаем тему через хук
    const theme = useTheme();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        data: queueTypeData,
        isLoading: isQueueLoading,
        error: queueError,
    } = useGetQueueTypeQuery();
    
    console.log("queueTypeData", queueTypeData)
    
    const handleSelectQueueType = (queueTypeId: string) => {
        dispatch(setQueueTypeId(queueTypeId));
        console.log("choosen queueTypeId", queueTypeId)
        navigate("/register");
    };

    const currentLanguage = i18n.language || "ru";

    return (
        <BackgroundContainer>
            <Box
                sx={{
                    marginBottom: theme.spacing(-1.3),
                }}
            >
                <StudentsIcon />
            </Box>

            <FormContainer>
                <BlurBackground />

                <Box
                    sx={{
                        paddingBottom: theme.spacing(5),
                        zIndex: 1,
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    {/* 2. Переключаем логотип в зависимости от темы */}
                    {theme.palette.mode === 'dark' ? <SULogoMDark /> : <SULogoM />}
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: theme.spacing(2),
                        zIndex: 1,
                    }}
                >
                    {isQueueLoading && (
                        <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
                            {t("loading")}...
                        </Typography>
                    )}

                    {queueError && (
                        <Typography variant="body2" color="error">
                            {t("failed_to_load_data")}
                        </Typography>
                    )}

                    {[...(queueTypeData?.value || [])]
                        .reverse()
                        .map((queueType: any) => (
                            <CustomButton
                                key={queueType.queueTypeId}
                                variantType="primary"
                                onClick={() =>
                                    handleSelectQueueType(queueType.queueTypeId)
                                }
                            >
                                {currentLanguage === "ru"
                                    ? queueType.nameRu
                                    : currentLanguage === "en"
                                    ? queueType.nameEn
                                    : queueType.nameKk}
                            </CustomButton>
                        ))}
                </Box>
            </FormContainer>
        </BackgroundContainer>
    );
};

export default Landing;