import { useTranslation } from "react-i18next";

export const useValidationRules = () => {
    const { t } = useTranslation();

    return {
        required: { required: t("i18n_register.required") },
        pattern: (regex: RegExp, message: string) => ({
            pattern: { value: regex, message },
        }),
        minLength: (length: number) => {
            return {
                minLength: {
                    value: length,
                    message: t("i18n_register.minLengthError", { length }),
                },
            };
        },
        maxLength: (length: number) => {
            return {
                maxLength: {
                    value: length,
                    message: t("i18n_register.maxLengthError", { length }),
                },
            };
        },
    };
};
