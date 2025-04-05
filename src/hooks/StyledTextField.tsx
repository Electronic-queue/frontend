import { TextField } from "@mui/material";
import { Controller, Control, RegisterOptions } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface StyledTextFieldProps {
    name: string;
    control: Control<any>;
    rules?: RegisterOptions;
    labelKey: string;
    fullWidth?: boolean;
    variant?: "outlined" | "filled" | "standard";
    type?: string;
    numericOnly?: boolean;
}

const StyledTextField: React.FC<StyledTextFieldProps> = ({
    name,
    control,
    rules,
    labelKey,
    fullWidth = true,
    variant = "outlined",
    type = "text",
    numericOnly = false,
}) => {
    const { t } = useTranslation();

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({
                field: { onChange, ...field },
                fieldState: { error },
            }) => (
                <TextField
                    {...field}
                    label={t(labelKey)}
                    variant={variant}
                    error={!!error}
                    helperText={error?.message}
                    fullWidth={fullWidth}
                    type={numericOnly ? "tel" : type}
                    inputProps={
                        numericOnly
                            ? { inputMode: "numeric", pattern: "[0-9]*" }
                            : {}
                    }
                    onChange={(e) => {
                        let value = e.target.value;
                        if (numericOnly) value = value.replace(/\D/g, "");
                        onChange(value);
                    }}
                />
            )}
        />
    );
};

export default StyledTextField;
