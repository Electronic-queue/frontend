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
    firstName?: string;
    lastName?: string;
    surname?: string;
}

const ClientRegisterPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userInfo = useSelector((state: RootState) => state.user.userInfo);
    const queueTypeId = useSelector(
        (state: RootState) => state.user.queueTypeId
    );

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

    const onSubmit = (data: FormValues) => {
        const ONLY_IIN_TYPE = "7e734f7d-5639-4826-9a00-6b11938762aa";

        const payload =
            queueTypeId === ONLY_IIN_TYPE
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
        navigate("/selection");
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
                    >
                        {t("i18n_register.submit")}
                    </CustomButton>
                </Box>
            </FormContainer>
        </BackgroundContainer>
    );
};

export default ClientRegisterPage;
