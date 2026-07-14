import { Box, Button, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();

    const isValid =
        form.lastName.trim().length > 0 &&
        form.firstName.trim().length > 0;

    return (
        <Box>
            <Typography
                sx={{
                    fontSize: 13,
                    color: "#356fbd",
                    fontWeight: 700,
                     fontFamily: '"Arial", "Roboto", sans-serif',
                    mb: 0.8,
                }}
            >
                {t("personalDataForm.step")}
            </Typography>

            <Typography
                sx={{
                    fontSize: 23,
                    fontWeight: 800,
                    color: "#111827",
                    mb: 0.7,
                     fontFamily: '"Arial", "Roboto", sans-serif',
                }}
            >
                {t("personalDataForm.title")}
            </Typography>

            <Typography
                sx={{
                    fontSize: 13,
                    color: "#6b7280",
                    lineHeight: 1.5,
                    mb: 2.5,
                }}
            >
                {t("personalDataForm.description")}
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
                    label={t("personalDataForm.fields.lastName")}
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
                    label={t("personalDataForm.fields.firstName")}
                    value={form.firstName}
                    disabled={isLoading}
                    onChange={(event) =>
                        onChange("firstName", event.target.value)
                    }
                    sx={inputStyles}
                />

                <TextField
                    fullWidth
                    label={t("personalDataForm.fields.surname")}
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
                    {t("personalDataForm.actions.continue")}
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
                    {t("personalDataForm.actions.changeIin")}
                </Button>
            </Box>
        </Box>
    );
};