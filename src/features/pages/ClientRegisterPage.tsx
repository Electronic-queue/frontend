import { useEffect } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { setUserInfo } from "src/store/userSlice";
import { RootState } from "src/store/store";
import { useNavigate } from "react-router-dom";
import { startSignalR } from "../signalR"; // Убедись, что путь верный
import { useRegisterClientMutation } from "src/store/signalRClientApi";
import { useLoginRecordMutation } from "src/store/userApi";
import { useHandleExistingSession } from "src/hooks/useHandleExistingSession"; // Наш новый хук

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
    firstName?: string;
    lastName?: string;
    surname?: string;
}

const ClientRegisterPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Selectors
    const userInfo = useSelector((state: RootState) => state.user.userInfo);
    const queueTypeId = useSelector((state: RootState) => state.user.queueTypeId);

    // API Mutations
    const [registerClient, { isLoading: isRegistering }] = useRegisterClientMutation();
    const [loginRecord, { isLoading: isLoggingIn }] = useLoginRecordMutation();

    // Custom Hook для восстановления сессии
    const { handleExistingSession } = useHandleExistingSession();

    // Form Setup
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: userInfo || {
            iin: "",
            firstName: "",
            lastName: "",
            surname: "",
        },
    });

    const { required, pattern, maxLength } = useValidationRules();

    // --- Логика для НОВОГО пользователя (вынесли в отдельную функцию для чистоты) ---
    const processNewUser = async (data: FormValues) => {
        console.log("👤 Обработка как Нового пользователя...");
        
        // 1. Подготовка данных (фильтрация полей для "только ИИН" очередей)
        const ONLY_IIN_TYPE = "7e734f7d-5639-4826-9a00-6b11938762aa";
        const payload = queueTypeId === ONLY_IIN_TYPE
            ? { ...data, firstName: "", lastName: "", surname: "" }
            : data;

        // 2. Сохраняем в Redux (чтобы на след. странице данные не пропали)
        dispatch(
            setUserInfo({
                ...payload,
                firstName: payload.firstName || "",
                lastName: payload.lastName || "",
                surname: payload.surname || "",
            })
        );

        // 3. Подключаем SignalR и регистрируем клиента
        try {
            const connectionId = await startSignalR();
            console.log("🔗 SignalR Connection ID:", connectionId);

            if (connectionId) {
                await registerClient({ connectionId }).unwrap();
                console.log("✅ SignalR: Клиент успешно зарегистрирован");
            } else {
                console.warn("⚠️ SignalR: Не удалось получить ID, но переходим дальше...");
            }
        } catch (err) {
            console.error("❌ Ошибка SignalR при регистрации:", err);
            // Даже если SignalR упал, мы все равно пускаем юзера выбрать услугу,
            // возможно подключение восстановится позже
        }

        // 4. Переход на выбор услуги
        navigate("/selection");
    };

    // --- MAIN SUBMIT HANDLER ---
    const onSubmit = async (data: FormValues) => {
        try {
            // ШАГ 1: Пытаемся залогиниться (проверить, есть ли активная запись)
            const response = await loginRecord({ iin: data.iin }).unwrap();
            
            // ШАГ 2: Проверяем, вернулась ли активная сессия
            if (response && response.record && response.token) {
                console.log("🔄 Найден активный талон. Восстанавливаем сессию...");
                
                // 🔥 ВЫЗЫВАЕМ НАШ ХУК
                handleExistingSession(response);
                
                return; // 🛑 ОСТАНАВЛИВАЕМСЯ ЗДЕСЬ (не регистрируем как нового)
            } else {
                // Если ответ пришел пустой (маловероятно при unwrap, но все же)
                await processNewUser(data);
            }

        } catch (error: any) {
            // ШАГ 3: Обработка ошибок входа
            
            // Если 404 (Not Found) -> значит клиента нет или нет активного талона -> Это НОВЫЙ клиент
            if (error?.status === 404 || error?.status === 401) {
                console.log("ℹ️ Активной записи нет (404/401). Регистрируем нового...");
                await processNewUser(data);
            } 
            // Если другие ошибки (500, 201 и т.д.), ваша логика тоже пускала дальше
            else {
                console.warn("⚠️ Ошибка входа:", error?.status, ". Пробуем зарегистрировать как нового.");
                await processNewUser(data);
            }
        }
    };

    const ONLY_IIN_TYPE = "7e734f7d-5639-4826-9a00-6b11938762aa";
    const showFullNameFields = queueTypeId !== ONLY_IIN_TYPE;

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

                    {showFullNameFields && (
                        <>
                            <StyledTextField
                                name="lastName"
                                control={control}
                                rules={{
                                    ...required,
                                    ...pattern(
                                        /^[a-zA-Zа-яА-ЯёЁәғқңөұүһіӘҒҚҢӨҰҮҺІ\s-]+$/,
                                        t("i18n_register.invalidNameError")
                                    ),
                                    ...maxLength(40),
                                }}
                                labelKey="i18n_register.lastName"
                            />

                            <StyledTextField
                                name="firstName"
                                control={control}
                                rules={{
                                    ...required,
                                    ...pattern(
                                        /^[a-zA-Zа-яА-ЯёЁәғқңөұүһіӘҒҚҢӨҰҮҺІ\s-]+$/,
                                        t("i18n_register.invalidNameError")
                                    ),
                                    ...maxLength(40),
                                }}
                                labelKey="i18n_register.firstName"
                            />

                            <StyledTextField
                                name="surname"
                                control={control}
                                rules={{
                                    ...pattern(
                                        /^[a-zA-Zа-яА-ЯёЁәғқңөұүһіӘҒҚҢӨҰҮҺІ\s-]+$/,
                                        t("i18n_register.invalidNameError")
                                    ),
                                    ...maxLength(40),
                                }}
                                labelKey="i18n_register.middleName"
                            />
                        </>
                    )}
                </Box>

                <Box sx={{ paddingTop: theme.spacing(5) }}>
                    <CustomButton
                        variantType="primary"
                        type="submit"
                        color="primary"
                        fullWidth
                        disabled={isRegistering || isLoggingIn}
                    >
                        {(isRegistering || isLoggingIn) ? "..." : t("i18n_register.submit")}
                    </CustomButton>
                </Box>
            </FormContainer>
        </BackgroundContainer>
    );
};

export default ClientRegisterPage;