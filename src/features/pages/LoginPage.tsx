import React, { useEffect } from "react";
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
import Link from "@mui/material/Link";
import QueueBackground from "src/assets/queue1.png";
import CustomButton from "src/components/Button";
import { useTranslation } from "react-i18next";
import theme from "src/styles/theme";

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
    boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(8px)",
    zIndex: 1,
}));

const LoginCard = styled(Stack)(({ theme }) => ({
    width: "85%",
    maxWidth: "545px",
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)",
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

const LoginPage: React.FC = () => {
    const { t } = useTranslation();

    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();
    const { control, handleSubmit } = useForm({
        defaultValues: {
            username: "",
            password: "",
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
                        <Typography>
                            {t("i18n_login.forgotPassword")}
                        </Typography>
                        <Link href="#" underline="hover" align="center">
                            {t("i18n_login.restoreAccess")}
                        </Link>
                    </Stack>
                </LoginCard>
            </LoginCardContainer>
        </BackgroundContainer>
    );
};

export default LoginPage;
