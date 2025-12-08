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

// --- ВАЛИДАТОР ИИН (Алгоритм с весовыми коэффициентами) ---
const validateIINChecksum = (iin: string): boolean => {
    if (!iin || iin.length !== 12) return false;
    
    // Преобразуем строку в массив цифр
    const digits = iin.split('').map(Number);
    // Последняя цифра - контрольная
    const controlDigit = digits[11];

    // 1. Первый проход (веса 1..11)
    let sum1 = 0;
    for (let i = 0; i < 11; i++) {
        sum1 += digits[i] * (i + 1);
    }
    let result = sum1 % 11;

    // 2. Если остаток 10, нужен второй проход (веса 3..11, 1, 2)
    if (result === 10) {
        let sum2 = 0;
        const weights2 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2];
        for (let i = 0; i < 11; i++) {
            sum2 += digits[i] * weights2[i];
        }
        result = sum2 % 11;
    }

    // 3. Если снова 10 — ИИН невалиден
    if (result === 10) return false;

    // 4. Сравниваем рассчитанную сумму с контрольной цифрой
    return result === controlDigit;
};


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
        mode: "onChange", // Валидация срабатывает при вводе
        defaultValues: { iin: "" },
    });

    const { required } = useValidationRules(); // Pattern убрал, т.к. проверка внутри validate

    // --- MAIN SUBMIT HANDLER ---
    const onSubmit = async (data: FormValues) => {
        try {
            // 1. Пытаемся залогиниться (проверить, есть ли активная запись)
            const response = await loginRecord({ iin: data.iin }).unwrap();

            // 2. Проверяем, вернулась ли активная сессия
            if (response && response.record && response.token) {
                console.log("🔄 Найден активный талон. Восстанавливаем сессию...");
                handleExistingSession(response);
                return; 
            }
            
            // Если unwrap() прошел, но нет записи/токена
            await handleNewClient(data.iin);

        } catch (error: any) {
            // 3. Обработка ошибок входа (404/401 - нет активного талона/клиента)
            if (error?.status === 404 || error?.status === 401) {
                console.log("ℹ️ Активной записи нет (404/401). Переходим на лендинг...");
                await handleNewClient(data.iin);
            } 
            // Другие ошибки
            else {
                console.error("❌ Ошибка входа (не 404/401). Попробуем перейти на лендинг:", error);
                await handleNewClient(data.iin);
            }
        }
    };
    
    // Функция для сохранения ИИН и перехода на лендинг
    const handleNewClient = (iin: string) => {
        dispatch(
            setUserInfo({ 
                iin, 
                firstName: "", 
                lastName: "", 
                surname: "",
            })
        );
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
                    {t("i18n_register.authentication")} 
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
                            // Сначала проверяем длину и цифры (быстрая проверка)
                            pattern: {
                                value: /^\d{12}$/,
                                message: t("i18n_register.iinLengthError") // "ИИН должен состоять из 12 цифр"
                            },
                            // Затем запускаем математический алгоритм (глубокая проверка)
                            validate: (value) => 
                                validateIINChecksum(value) || t("i18n_register.iinInvalidChecksum") // "Некорректный ИИН"
                        }}
                        labelKey="i18n_register.iin"
                        numericOnly={true}
                    />
                </Box>

                <Box sx={{ paddingTop: theme.spacing(3) }}>
                    <CustomButton
                        variantType="primary"
                        type="submit"
                        color="primary"
                        fullWidth
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? "..." : t("i18n_register.check")} 
                    </CustomButton>
                </Box>
                
                {/* Текст подсказки с обновленными стилями */}
                <Box sx={{
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center", 
                    textAlign: "center", 
                    paddingTop: "20px"
                }}>
                    <Typography sx={{
                        fontSize: "14px", // Уменьшил с 18px до 14px (UI совет)
                        color: "#6B7280", // Серый цвет
                        lineHeight: 1.4
                    }}>
                        Введите ИИН, чтобы записаться или проверить статус активного талона.
                    </Typography>
                </Box> 
            </FormContainer>
        </BackgroundContainer>
    );
};

export default CheckSessionPage;