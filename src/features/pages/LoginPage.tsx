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
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import QueueBackground from "src/assets/queue1.png";
import CustomButton from "src/components/Button";

const BackgroundContainer = styled(Box)(({ theme }) => ({
    backgroundImage: `url(${QueueBackground})`,
    backgroundColor: "#e4e7ec",
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
const LoginCard = styled(Stack)(({ theme }) => ({
    width: "545px",
    backgroundColor: "white",
    borderRadius: theme.spacing(2),
    boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: `${theme.spacing(4)} ${theme.spacing(6)} ${theme.spacing(4)} ${theme.spacing(6)}`,
    gap: "20px",
}));

const FormContainer = styled(Stack)(({ theme }) => ({
    width: "100%",
    gap: theme.spacing(2),
}));

const LoginPage: React.FC = () => {
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
            <LoginCard>
                <Box>
                    <Typography variant="h2" align="center" gutterBottom>
                        Вход
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
                            rules={{ required: "Введите логин" }}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="Логин"
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
                            rules={{ required: "Введите пароль" }}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="Пароль"
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
                            {loading ? "Загрузка..." : "Войти"}
                        </CustomButton>
                    </FormContainer>
                </form>
                <hr style={{ width: "100%", color: "#9E9E9E" }} />
                <Stack
                    spacing={1}
                    mt={2}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Typography>Забыли пароль?</Typography>
                    <Link href="#" underline="hover" align="center">
                        Восстановить доступ
                    </Link>
                </Stack>
            </LoginCard>
        </BackgroundContainer>
    );
};

export default LoginPage;
