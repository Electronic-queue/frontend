import { TextField } from "@mui/material";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

const useValidationRules = () => {
    const { t } = useTranslation();

    return {
        required: (messageKey: string) => ({ required: t(messageKey) }),
        pattern: (regex: RegExp, messageKey: string) => ({
            pattern: { value: regex, message: t(messageKey) },
        }),
        minLength: (length: number, messageKey: string) => ({
            minLength: { value: length, message: t(messageKey) },
        }),
        maxLength: (length: number, messageKey: string) => ({
            maxLength: { value: length, message: t(messageKey) },
        }),
    };
};

interface StyledTextFieldProps {
    name: string;
    control: any;
    rules?: any;
    labelKey: string;
    fullWidth?: boolean;
    variant?: "outlined" | "filled" | "standard";
}

const StyledTextField: React.FC<StyledTextFieldProps> = ({
    name,
    control,
    rules,
    labelKey,
    fullWidth = true,
    variant = "outlined",
}) => {
    const { t } = useTranslation();

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState: { error } }) => (
                <TextField
                    {...field}
                    label={t(labelKey)}
                    variant={variant}
                    error={!!error}
                    helperText={error?.message}
                    fullWidth={fullWidth}
                />
            )}
        />
    );
};

export { useValidationRules };
export default StyledTextField;
