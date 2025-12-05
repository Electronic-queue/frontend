// src/features/pages/CheckSessionPage.tsx
import { useForm } from "react-hook-form";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { SULogoM } from "src/assets";
import theme from "src/styles/theme";
import CustomButton from "src/components/Button";
import StyledTextField from "src/hooks/StyledTextField";
import { useValidationRules } from "src/hooks/useValidationRules";
import { useDispatch } from "react-redux";
import { setUserInfo } from "src/store/userSlice";
import { useNavigate } from "react-router-dom";
import { useLoginRecordMutation } from "src/store/userApi";
import { useHandleExistingSession } from "src/hooks/useHandleExistingSession";

// Переиспользуем стили
const BackgroundContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(5),
}));

const FormContainer = styled(Stack)(({ theme }) => ({
    width: "100%",
    maxWidth: "400px",
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[4],
}));

interface FormValues {
    iin: string;
}

const CheckSessionPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // API Mutation
    const [loginRecord, { isLoading: isLoggingIn }] = useLoginRecordMutation();

    // Custom Hook для восстановления сессии
    const { handleExistingSession } = useHandleExistingSession();

    // Form Setup - Только поле iin
    const {
        control,
        handleSubmit,
    } = useForm<FormValues>({
        defaultValues: { iin: "" },
    });

    const { required, pattern } = useValidationRules();

    // --- MAIN SUBMIT HANDLER ---
    const onSubmit = async (data: FormValues) => {
        try {
            // 1. Пытаемся залогиниться (проверить, есть ли активная запись)
            const response = await loginRecord({ iin: data.iin }).unwrap();

            // 2. Проверяем, вернулась ли активная сессия
            if (response && response.record && response.token) {
                console.log("🔄 Найден активный талон. Восстанавливаем сессию...");
                handleExistingSession(response);
                return; // 🛑 Редирект на /wait происходит внутри handleExistingSession
            }
            
            // Если unwrap() прошел, но нет записи/токена (маловероятно),
            // переходим к регистрации
            await handleNewClient(data.iin);

        } catch (error: any) {
            // 3. Обработка ошибок входа (404/401 - нет активного талона/клиента)
            if (error?.status === 404 || error?.status === 401) {
                console.log("ℹ️ Активной записи нет (404/401). Переходим на лендинг...");
                await handleNewClient(data.iin);
            } 
            // Другие ошибки (500, network error)
            else {
                console.error("❌ Ошибка входа (не 404/401). Попробуем перейти на лендинг:", error);
                await handleNewClient(data.iin); // Лучше пропустить, чем застрять
            }
        }
    };
    
    // Функция для сохранения ИИН и перехода на лендинг
    const handleNewClient = (iin: string) => {
        // Сохраняем ИИН в Redux для ClientRegisterPage
        dispatch(
            setUserInfo({ 
                iin, 
                firstName: "", 
                lastName: "", 
                surname: "",
            })
        );
        // Редирект на LandingPage (выбор категории)
        navigate("/landing");
    }


    return (
        <BackgroundContainer>
            <Box sx={{ paddingBottom: theme.spacing(2) }}>
                <SULogoM />
            </Box>

            <FormContainer as="form" onSubmit={handleSubmit(onSubmit)}>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{ marginBottom: 2, textAlign: "center" }}
                >
                    {t("i18n_register.title")} 
                    {/* Предполагается, что в i18n_register.title есть что-то типа "Вход или Регистрация" */}
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: theme.spacing(2),
                    }}
                >
                    <StyledTextField
                        name="iin"
                        control={control}
                        rules={{
                            ...required,
                            ...pattern(
                                /^\d{12}$/,
                                t("i18n_register.iinLengthError")
                            ),
                        }}
                        labelKey="i18n_register.iin"
                        numericOnly={true}
                    />
                </Box>

                <Box sx={{ paddingTop: theme.spacing(5) }}>
                    <CustomButton
                        variantType="primary"
                        type="submit"
                        color="primary"
                        fullWidth
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? "..." : t("i18n_register.check")} 
                        {/* Вам нужно будет добавить ключ i18n_register.check */}
                    </CustomButton>
                </Box>
            </FormContainer>
        </BackgroundContainer>
    );
};

export default CheckSessionPage;