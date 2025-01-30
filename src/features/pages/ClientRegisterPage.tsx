import { useForm, Controller } from "react-hook-form";
import { Box, Stack, TextField, Typography, styled } from "@mui/material";
import { useTranslation } from "react-i18next";
import { SULogoM } from "src/assets";
import theme from "src/styles/theme";
import CustomButton from "src/components/Button";

const BackgroundContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.background.default,
    paddingTop: "34px",
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
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>();

    const onSubmit = (data: FormValues) => {
        console.log("Form Data:", data);
    };

    return (
        <BackgroundContainer>
            <Box sx={{ paddingBottom: theme.spacing(5) }}>
                <SULogoM />
            </Box>

            <FormContainer
                spacing={3}
                as="form"
                onSubmit={handleSubmit(onSubmit)}
            >
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{ marginBottom: 2 }}
                    >
                        {t("i18n_register.title")}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: theme.spacing(2),
                    }}
                >
                    <Controller
                        name="iin"
                        control={control}
                        rules={{
                            required: t("i18n_register.required") as string,
                            pattern: {
                                value: /^\d{12}$/,
                                message: t("i18n_register.iinError"),
                            },
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label={t("i18n_register.iin")}
                                variant="outlined"
                                error={!!errors.iin}
                                helperText={errors.iin?.message}
                                fullWidth
                            />
                        )}
                    />
                    <Controller
                        name="firstName"
                        control={control}
                        rules={{
                            required: t("i18n_register.required") as string,
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label={t("i18n_register.firstName")}
                                variant="outlined"
                                error={!!errors.firstName}
                                helperText={errors.firstName?.message}
                                fullWidth
                            />
                        )}
                    />
                    <Controller
                        name="lastName"
                        control={control}
                        rules={{
                            required: t("i18n_register.required") as string,
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label={t("i18n_register.lastName")}
                                variant="outlined"
                                error={!!errors.lastName}
                                helperText={errors.lastName?.message}
                                fullWidth
                            />
                        )}
                    />
                    <Controller
                        name="middleName"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label={t("i18n_register.middleName")}
                                variant="outlined"
                                fullWidth
                            />
                        )}
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
