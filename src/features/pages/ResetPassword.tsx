import { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";

import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import QueueBackground from "src/assets/queue1.png";
import CustomButton from "src/components/Button";
import { useTranslation } from "react-i18next";
import { useChangePasswordMutation } from "src/store/managerApi";
import { useSearchParams } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material"; // импорт иконок
import { IconButton, InputAdornment } from "@mui/material";
import ReusableModal from "src/components/ModalPage";

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

const RessetPassowd: FC = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const tokenFromUrl = searchParams.get("token");
    const [changePassword, { isLoading }] = useChangePasswordMutation();
    const [isOpen, setIsOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();
    const [apiError, setApiError] = useState<string | null>(null);
    const handleModalOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            ressetPassword: "",
            confirmPassword: "",
        },
    });

    const ressetPassword = watch("ressetPassword");
    const confirmPassword = watch("confirmPassword");

    const { loading, error, isAuthenticated } = useSelector(
        (state: RootState) => state.auth
    );

    const onSubmit = async (data: {
        ressetPassword: string;
        confirmPassword: string;
    }) => {
        if (!tokenFromUrl) {
            console.error("No token in URL");
            return;
        }
        setApiError(null);

        try {
            const response = await changePassword({
                accessToken: tokenFromUrl,
                password: data.ressetPassword,
            }).unwrap();

            navigate("/login");
        } catch (error: any) {
            console.error("Error during password reset:", error);
            setApiError(error?.data?.message || t("i18n_login.defaultError"));

            if (error?.status === 403) {
                handleModalOpen();
                setApiError(t("i18n_login.restoreAccessText"));
            }
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/manager/queue");
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

    {
        isLoading ? t("i18n_login.loading") : t("i18n_login.changePassword");
    }

    const isSubmitDisabled =
        !ressetPassword || !confirmPassword || Object.keys(errors).length > 0;

    return (
        <BackgroundContainer>
            <LoginCardContainer>
                <BackgroundCard />
                <LoginCard>
                    <Box>
                        <Typography variant="h2" align="center" gutterBottom>
                            {t("i18n_login.ressetPassword")}
                        </Typography>
                    </Box>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        style={{ width: "100%" }}
                    >
                        <FormContainer>
                            <Controller
                                name="ressetPassword"
                                control={control}
                                rules={{
                                    required: t("i18n_login.enterPassword"),
                                    minLength: {
                                        value: 8,
                                        message: t(
                                            "i18n_login.minLengthPassword",
                                            { count: 8 }
                                        ),
                                    },
                                }}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        label={t("i18n_login.newPassword")}
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        variant="outlined"
                                        autoComplete="false"
                                        fullWidth
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={
                                                            handleClickShowPassword
                                                        }
                                                        edge="end"
                                                    >
                                                        {showPassword ? (
                                                            <Visibility />
                                                        ) : (
                                                            <VisibilityOff />
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                )}
                            />

                            <Controller
                                name="confirmPassword"
                                control={control}
                                rules={{
                                    required: t(
                                        "i18n_login.confirmPasswordRequired"
                                    ),
                                    validate: (value) =>
                                        value === ressetPassword ||
                                        t("i18n_login.passwordsDoNotMatch"),
                                }}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        label={t(
                                            "i18n_login.confirmPasswordRequired"
                                        )}
                                        type={"password"}
                                        variant="outlined"
                                        autoComplete="false"
                                        fullWidth
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                        InputProps={{}}
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
                                disabled={isSubmitDisabled}
                            >
                                {loading
                                    ? t("i18n_login.loading")
                                    : t("i18n_login.changePassword")}
                            </CustomButton>

                            <ReusableModal
                                open={isOpen}
                                onClose={handleClose}
                                title={t("i18n_login.linkAlreadyUsed")}
                                width={645}
                                showCloseButton={false}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 2,
                                        textAlign: "center",
                                        padding: 2,
                                    }}
                                >
                                    <CustomButton
                                        variantType="primary"
                                        onClick={() => navigate("/login")}
                                    >
                                        {t("i18n_login.goToLogin")}
                                    </CustomButton>
                                </Box>
                            </ReusableModal>
                        </FormContainer>
                    </form>
                </LoginCard>
            </LoginCardContainer>
        </BackgroundContainer>
    );
};

export default RessetPassowd;
