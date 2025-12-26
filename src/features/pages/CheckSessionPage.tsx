// src/features/pages/CheckSessionPage.tsx
import { useForm } from "react-hook-form";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { styled, useTheme } from "@mui/material/styles"; // 1. Импортируем useTheme здесь
import { useTranslation } from "react-i18next";
import { SULogoM, SULogoMDark } from "src/assets";
// УДАЛЕНО: import theme from "src/styles/theme"; <-- Это мешало переключению
import CustomButton from "src/components/Button";
import StyledTextField from "src/hooks/StyledTextField";
import { useValidationRules } from "src/hooks/useValidationRules";
import { useDispatch } from "react-redux";
import { setUserInfo } from "src/store/userSlice";
import { useNavigate } from "react-router-dom";
import { useLoginRecordMutation } from "src/store/userApi";
import { useHandleExistingSession } from "src/hooks/useHandleExistingSession";

const validateIINChecksum = (iin: string): boolean => {
    if (!iin || iin.length !== 12) return false;

    const digits = iin.split("").map(Number);
    const controlDigit = digits[11];

    let sum1 = 0;
    for (let i = 0; i < 11; i++) {
        sum1 += digits[i] * (i + 1);
    }
    let result = sum1 % 11;

    if (result === 10) {
        let sum2 = 0;
        const weights2 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2];
        for (let i = 0; i < 11; i++) {
            sum2 += digits[i] * weights2[i];
        }
        result = sum2 % 11;
    }

    if (result === 10) return false;

    return result === controlDigit;
};

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
    const theme = useTheme();

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [loginRecord, { isLoading: isLoggingIn }] = useLoginRecordMutation();

    const { handleExistingSession } = useHandleExistingSession();

    const { control, handleSubmit } = useForm<FormValues>({
        mode: "onChange",
        defaultValues: { iin: "" },
    });

    const { required, pattern } = useValidationRules();

    const onSubmit = async (data: FormValues) => {
        try {
            const response = await loginRecord({ iin: data.iin }).unwrap();
            if (response && response.record && response.token) {
                handleExistingSession(response);
                return;
            }

            await handleNewClient(data.iin);
        } catch (error: any) {
            if (error?.status === 404 || error?.status === 401) {
                await handleNewClient(data.iin);
            } else {
                console.error(
                    "❌ Ошибка входа (не 404/401). Попробуем перейти на лендинг:",
                    error
                );
                await handleNewClient(data.iin);
            }
        }
    };

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
    };

    return (
        <BackgroundContainer>
            <Box sx={{ paddingBottom: theme.spacing(2) }}>
                {theme.palette.mode === "dark" ? <SULogoMDark /> : <SULogoM />}
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
                            pattern: {
                                value: /^\d{12}$/,
                                message: t("i18n_register.iinLengthError"),
                            },
                            validate: (value) =>
                                validateIINChecksum(value) ||
                                t("i18n_register.iinInvalidChecksum"), // "Некорректный ИИН"
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

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        paddingTop: "20px",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: "14px",
                            color:
                                theme.palette.mode === "dark"
                                    ? "#ffff"
                                    : "#6B7280",
                            lineHeight: 1.4,
                        }}
                    >
                        Введите ИИН, чтобы записаться в электронную очередь или
                        проверить статус активного талона.
                    </Typography>
                </Box>
            </FormContainer>
        </BackgroundContainer>
    );
};

export default CheckSessionPage;
