import { Box, Button, TextField, Typography } from "@mui/material";
import { StudentFormData } from "../model/types";
import { inputStyles, primaryButtonStyles } from "./commonStyles";

interface PersonalDataFormProps {
    form: StudentFormData;
    isLoading: boolean;
    onChange: (field: keyof StudentFormData, value: string) => void;
    onSubmit: () => void;
    onBack: () => void;
}

export const PersonalDataForm = ({
    form,
    isLoading,
    onChange,
    onSubmit,
    onBack,
}: PersonalDataFormProps) => {
    const isValid =
        form.lastName.trim().length > 0 && form.firstName.trim().length > 0;

    return (
        <Box>
            <Typography
                sx={{
                    fontSize: 13,
                    color: "#356fbd",
                    fontWeight: 700,
                    mb: 0.8,
                }}
            >
                Шаг 1 из 2
            </Typography>

            <Typography
                sx={{
                    fontSize: 23,
                    fontWeight: 800,
                    color: "#111827",
                    mb: 0.7,
                }}
            >
                Личные данные
            </Typography>

            <Typography
                sx={{
                    fontSize: 13,
                    color: "#6b7280",
                    lineHeight: 1.5,
                    mb: 2.5,
                }}
            >
                Активная заявка не найдена. Укажите данные пользователя.
            </Typography>

            <Box
                component="form"
                onSubmit={(event) => {
                    event.preventDefault();

                    if (isValid && !isLoading) {
                        onSubmit();
                    }
                }}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.7,
                }}
            >
                <TextField
                    required
                    fullWidth
                    label="Фамилия"
                    value={form.lastName}
                    disabled={isLoading}
                    onChange={(event) =>
                        onChange("lastName", event.target.value)
                    }
                    sx={inputStyles}
                />

                <TextField
                    required
                    fullWidth
                    label="Имя"
                    value={form.firstName}
                    disabled={isLoading}
                    onChange={(event) =>
                        onChange("firstName", event.target.value)
                    }
                    sx={inputStyles}
                />

                <TextField
                    fullWidth
                    label="Отчество"
                    value={form.surname}
                    disabled={isLoading}
                    onChange={(event) =>
                        onChange("surname", event.target.value)
                    }
                    sx={inputStyles}
                />

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={!isValid || isLoading}
                    sx={{
                        ...primaryButtonStyles,
                        mt: 0.5,
                    }}
                >
                    Продолжить
                </Button>

                <Button
                    fullWidth
                    disabled={isLoading}
                    onClick={onBack}
                    sx={{
                        minHeight: 44,
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: 700,
                        color: "#64748b",
                    }}
                >
                    Изменить ИИН
                </Button>
            </Box>
        </Box>
    );
};
