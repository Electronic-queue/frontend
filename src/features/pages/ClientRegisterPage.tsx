import { useForm } from "react-hook-form";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { styled, useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { SULogoM, SULogoMDark } from "src/assets";
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
    // minHeight: "100vh",
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
    firstName: string;
    lastName: string;
    surname: string;
}

const ClientRegisterPage = () => {
    const theme = useTheme();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Получаем текущие данные из стора (включая ИИН, введенный ранее)
    const userInfo = useSelector((state: RootState) => state.user.userInfo);

    const [registerClient, { isLoading: isRegistering }] = useRegisterClientMutation();
    const [loginRecord, { isLoading: isLoggingIn }] = useLoginRecordMutation();
    const { handleExistingSession } = useHandleExistingSession();

    const {
        control,
        handleSubmit,
    } = useForm<FormValues>({
        // Важно: передаем userInfo в defaultValues, чтобы ИИН подтянулся в data при отправке
        defaultValues: {
            iin: userInfo?.iin || "",
            firstName: userInfo?.firstName || "",
            lastName: userInfo?.lastName || "",
            surname: userInfo?.surname || "",
        },
    });

    const { required, pattern, maxLength } = useValidationRules();

    const processNewUser = async (data: FormValues) => {
        dispatch(
            setUserInfo({
                ...data,
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                surname: data.surname || "",
            })
        );

        try {
            const connectionId = await startSignalR();
            if (connectionId) {
                await registerClient({ connectionId }).unwrap();
            }
        } catch (err) {
            console.error("❌ SignalR Error:", err);
        }

        navigate("/selection");
    };

    const onSubmit = async (data: FormValues) => {
        try {
            // Используем ИИН из данных формы (пришел из defaultValues)
            const response = await loginRecord({ iin: data.iin }).unwrap();

            if (response && response.record && response.token) {
                handleExistingSession(response);
            } else {
                await processNewUser(data);
            }
        } catch (error: any) {
            // Если сессии нет, регистрируем как нового
            await processNewUser(data);
        }
    };

    return (
        <BackgroundContainer>
            <Box sx={{ paddingBottom: theme.spacing(2) }}>
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
                    {/* Поля ФИО теперь отображаются ВСЕГДА */}
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
                </Box>

                <Box sx={{ paddingTop: theme.spacing(5) }}>
                    <CustomButton
                        variantType="primary"
                        type="submit"
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