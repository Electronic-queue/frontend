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
    firstName: string;
    lastName: string;
    middleName?: string;
}

const ClientRegisterPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userInfo = useSelector((state: RootState) => state.user.userInfo);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/wait");
        }
    }, [navigate]);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: userInfo || {
            iin: "",
            firstName: "",
            lastName: "",
            middleName: "",
        },
    });

    const { required, pattern, maxLength, minLength } = useValidationRules();

    const onSubmit = (data: FormValues) => {
        dispatch(setUserInfo(data));

        navigate("/selection");
    };

    return (
        <BackgroundContainer>
            <Box sx={{ paddingBottom: theme.spacing(5) }}>
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
                    />

                    <StyledTextField
                        name="firstName"
                        control={control}
                        rules={{
                            ...required,
                            ...minLength(2),
                            ...maxLength(40),
                        }}
                        labelKey="i18n_register.firstName"
                    />

                    <StyledTextField
                        name="lastName"
                        control={control}
                        rules={{
                            ...required,
                            ...minLength(2),
                            ...maxLength(40),
                        }}
                        labelKey="i18n_register.lastName"
                    />

                    <StyledTextField
                        name="middleName"
                        control={control}
                        rules={{ ...minLength(2), ...maxLength(40) }}
                        labelKey="i18n_register.middleName"
                    />
                </Box>

                <Box sx={{ paddingTop: theme.spacing(5) }}>
                    <CustomButton
                        variantType="primary"
                        type="submit"
                        color="primary"
                        fullWidth
                    >
                        {t("i18n_register.submit")}
                    </CustomButton>
                </Box>
            </FormContainer>
        </BackgroundContainer>
    );
};

export default ClientRegisterPage;
