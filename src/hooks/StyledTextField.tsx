import { TextField } from "@mui/material";
import { Controller, Control, RegisterOptions } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";

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
    const theme = useTheme();

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
                    sx={{
                        "& input:-webkit-autofill": {
                            WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.paper} inset !important`,
                            WebkitTextFillColor: `${theme.palette.text.primary} !important`,
                            transition: "background-color 5000s ease-in-out 0s",
                        },
                        "& .MuiInputBase-input": {
                            color: theme.palette.text.primary,
                        },
                        "& .MuiInputLabel-root": {
                            color: theme.palette.text.secondary,
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                            color: error ? theme.palette.error.main : theme.palette.text.primary,
                        },
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                borderColor: theme.palette.divider,
                            },
                            "&:hover fieldset": {
                                borderColor: theme.palette.text.secondary,
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: error ? theme.palette.error.main : theme.palette.text.primary,
                                borderWidth: "1px",
                            },
                        },
                        "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.error.main,
                        }
                    }}
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