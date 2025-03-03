import { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { login } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import QueueBackground from "src/assets/queue1.png";
import CustomButton from "src/components/Button";
import { useTranslation } from "react-i18next";
import theme from "src/styles/theme";
import ReusableModal from "src/components/ModalPage";
import { useValidationRules } from "src/hooks/useValidationRules";
import StyledTextField from "src/hooks/StyledTextField";

const BackgroundContainer = styled(Box)(() => ({
    backgroundImage: `url(${QueueBackground})`,
    backgroundSize: "contain",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    width: "100%",
    height: "100vh",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
}));

const BackgroundCard = styled(Box)(({ theme }) => ({
    position: "absolute",
    width: "90%",
    maxWidth: "724px",
    height: "130%",
    maxHeight: "639px",
    backgroundColor: theme.palette.semiTransparentWhite.main,
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[4],
    backdropFilter: "blur(8px)",
    zIndex: 1,
}));

const LoginCard = styled(Stack)(({ theme }) => ({
    width: "85%",
    maxWidth: "545px",
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[5],
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: `${theme.spacing(4)} ${theme.spacing(6)} ${theme.spacing(4)} ${theme.spacing(6)}`,
    gap: "20px",
    zIndex: 3,

    [theme.breakpoints.down("sm")]: {
        padding: `${theme.spacing(3)} ${theme.spacing(2)}`,
        gap: "15px",
    },
}));

const LoginCardContainer = styled(Box)(({ theme }) => ({
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
}));

const FormContainer = styled(Stack)(({ theme }) => ({
    width: "100%",
    gap: theme.spacing(2),

    [theme.breakpoints.down("sm")]: {
        gap: theme.spacing(1.5),
    },
}));

const ModalPageWrapper = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: `${theme.spacing(0.3)} ${theme.spacing(6)} ${theme.spacing(4)} ${theme.spacing(6)}`,
    gap: "20px",
}));
const ModalInnerWrapper = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
}));

const RestoreAccessText = styled(Typography)(({ theme }) => ({
    cursor: "pointer",
    color: theme.palette.primary.main,
    ":hover": {
        textDecoration: "underline",
    },
}));

const LoginPage: FC = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const handleModalOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();
    const { control, handleSubmit } = useForm({
        defaultValues: {
            username: "",
            password: "",
            email: "",
        },
    });

    const { loading, error, isAuthenticated } = useSelector(
        (state: RootState) => state.auth
    );

    const onSubmit = (data: { username: string; password: string }) => {
        dispatch(login(data));
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    const [isDisabled, setIsDisabled] = useState(false);
    const [remainingTime, setRemainingTime] = useState(60);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;

        if (isDisabled && remainingTime > 0) {
            timer = setInterval(() => {
                setRemainingTime((prev) => prev - 1);
            }, 1000);
        } else if (remainingTime === 0) {
            setIsDisabled(false);
            setRemainingTime(60);
        }

        return () => clearInterval(timer);
    }, [isDisabled, remainingTime]);

    const onSubmitResetPassword = (data: { email: string }) => {
        setIsDisabled(true);
    };
    const { required, pattern, maxLength, minLength } = useValidationRules();

    return (
        <BackgroundContainer>
            <LoginCardContainer>
                <BackgroundCard />
                <LoginCard>
                    <Box>
                        <Typography variant="h2" align="center" gutterBottom>
                            {t("i18n_login.title")}
                        </Typography>
                    </Box>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        style={{ width: "100%" }}
                    >
                        <FormContainer>
                            <Controller
                                name="username"
                                control={control}
                                rules={{
                                    required: t("i18n_login.enterUsername"),
                                }}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        label={t("i18n_login.username")}
                                        variant="outlined"
                                        fullWidth
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                    />
                                )}
                            />
                            <Controller
                                name="password"
                                control={control}
                                rules={{
                                    required: t("i18n_login.enterPassword"),
                                }}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        label={t("i18n_login.password")}
                                        type="password"
                                        variant="outlined"
                                        fullWidth
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                    />
                                )}
                            />
                            {error && (
                                <Typography color="error" align="center">
                                    {error}
                                </Typography>
                            )}
                            <CustomButton
                                variantType="primary"
                                type="submit"
                                fullWidth
                                disabled={loading}
                            >
                                {loading
                                    ? t("i18n_login.loading")
                                    : t("i18n_login.login")}
                            </CustomButton>
                        </FormContainer>
                    </form>
                    <hr
                        style={{
                            width: "100%",
                            color: theme.palette.gray.main,
                        }}
                    />
                    <Stack
                        spacing={1}
                        mt={2}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <RestoreAccessText onClick={handleModalOpen}>
                            {t("i18n_login.forgotPassword")}
                        </RestoreAccessText>
                    </Stack>
                </LoginCard>
            </LoginCardContainer>
            <ReusableModal
                open={isOpen}
                onClose={handleClose}
                title={t("i18n_login.restoreAccessTitle")}
                width={645}
                showCloseButton={false}
            >
                <ModalPageWrapper>
                    <form onSubmit={handleSubmit(onSubmitResetPassword)}>
                        <ModalInnerWrapper>
                            <StyledTextField
                                name="email"
                                control={control}
                                rules={{
                                    ...required,
                                    ...pattern(
                                        /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
                                        t("i18n_login.invalidEmail")
                                    ),
                                }}
                                labelKey="i18n_login.email"
                            />

                            <CustomButton
                                variantType="primary"
                                size="small"
                                type="submit"
                                disabled={isDisabled}
                                sx={{ width: 400 }}
                            >
                                {isDisabled
                                    ? `${t("i18n_login.resendEmail")} `
                                    : t("i18n_login.sendResetPasswordEmail")}
                            </CustomButton>
                            {isDisabled && (
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        textAlign: "center",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            color: theme.palette.grey[600],
                                            fontSize:
                                                theme.typography.body1.fontSize,
                                        }}
                                    >
                                        {t("i18n_login.retry")} {remainingTime}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color: theme.palette.grey[600],
                                            fontSize:
                                                theme.typography.body1.fontSize,
                                        }}
                                    >
                                        {t("i18n_login.notFoundEmail")}
                                    </Typography>
                                </Box>
                            )}
                        </ModalInnerWrapper>
                    </form>
                </ModalPageWrapper>
            </ReusableModal>
        </BackgroundContainer>
    );
};

export default LoginPage;
