// src/features/pages/ClientRegisterPage.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
// 1. Импортируем useTheme
import { styled, useTheme } from "@mui/material/styles"; 
import { useTranslation } from "react-i18next";
// 2. Импортируем оба логотипа
import { SULogoM, SULogoMDark } from "src/assets"; 
// УДАЛЕНО: import theme from "src/styles/theme"; <-- Это мешало смене фона
import CustomButton from "src/components/Button";
import StyledTextField from "src/hooks/StyledTextField";
import { useValidationRules } from "src/hooks/useValidationRules";
import { useDispatch, useSelector } from "react-redux";
import { setUserInfo } from "src/store/userSlice";
import { RootState } from "src/store/store";
import { useNavigate } from "react-router-dom";
import { startSignalR } from "../signalR"; 
import { useRegisterClientMutation } from "src/store/signalRClientApi";
import { useLoginRecordMutation } from "src/store/userApi";
import { useHandleExistingSession } from "src/hooks/useHandleExistingSession";

const BackgroundContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    // Теперь цвет будет браться динамически из темы (белый или темный)
    backgroundColor: theme.palette.background.default, 
    paddingTop: theme.spacing(5),
}));

const FormContainer = styled(Stack)(({ theme }) => ({
    width: "100%",
    maxWidth: "400px",
    padding: theme.spacing(4),
    // В темной теме будет #121212 (или то, что в theme.ts для paper)
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
    // 3. Вызываем хук темы
    const theme = useTheme();
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

    const processNewUser = async (data: FormValues) => {
       
        
        const ONLY_IIN_TYPE = "7e734f7d-5639-4826-9a00-6b11938762aa";
        const payload = queueTypeId === ONLY_IIN_TYPE
            ? { ...data, firstName: "", lastName: "", surname: "" }
            : data;

        dispatch(
            setUserInfo({
                ...payload,
                firstName: payload.firstName || "",
                lastName: payload.lastName || "",
                surname: payload.surname || "",
            })
        );

        try {
            const connectionId = await startSignalR();

            if (connectionId) {
                await registerClient({ connectionId }).unwrap();
                
            } else {
                console.warn("⚠️ SignalR: Не удалось получить ID, но переходим дальше...");
            }
        } catch (err) {
            console.error("❌ Ошибка SignalR при регистрации:", err);
        }

        navigate("/selection");
    };

    // --- MAIN SUBMIT HANDLER ---
    const onSubmit = async (data: FormValues) => {
        try {
            const response = await loginRecord({ iin: data.iin }).unwrap();
            
            if (response && response.record && response.token) {
                handleExistingSession(response);
                return; 
            } else {
                await processNewUser(data);
            }

        } catch (error: any) {
            if (error?.status === 404 || error?.status === 401) {
                await processNewUser(data);
            } 
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
                {/* 4. Логика смены логотипа */}
                {theme.palette.mode === 'dark' ? <SULogoMDark /> : <SULogoM />}
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
                    {/* <StyledTextField
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
                    /> */}

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