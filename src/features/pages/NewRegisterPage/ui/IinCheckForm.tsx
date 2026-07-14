import {
    Box,
    Button,
    CircularProgress,
    TextField,
    Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { inputStyles, primaryButtonStyles } from "./commonStyles";

interface IinCheckFormProps {
    iin: string;
    isLoading: boolean;
    error: string;
    onIinChange: (value: string) => void;
    onCheck: () => void;
}

export const IinCheckForm = ({
    iin,
    isLoading,
    error,
    onIinChange,
    onCheck,
}: IinCheckFormProps) => {
    const { t } = useTranslation();

    return (
        <Box>
            <Typography
                sx={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#111827",
                    fontFamily: '"Arial", "Roboto", sans-serif',
                    mb: 0.7,
                }}
            >
                {t("iinCheckForm.title")}
            </Typography>

            <Typography
                sx={{
                    mb: 2.5,
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: "#6b7280",
                }}
            >
                {t("iinCheckForm.description")}
            </Typography>

            <TextField
                fullWidth
                label={t("iinCheckForm.fields.iin")}
                value={iin}
                placeholder={t("iinCheckForm.fields.placeholder")}
                disabled={isLoading}
                error={Boolean(error)}
                helperText={
                    error ||
                    t("iinCheckForm.fields.counter", {
                        current: iin.length,
                        max: 12,
                    })
                }
                onChange={(event) => onIinChange(event.target.value)}
                onKeyDown={(event) => {
                    if (
                        event.key === "Enter" &&
                        iin.length === 12 &&
                        !isLoading
                    ) {
                        onCheck();
                    }
                }}
                inputProps={{
                    maxLength: 12,
                    inputMode: "numeric",
                }}
                sx={{
                    ...inputStyles,
                    "& .MuiFormHelperText-root": {
                        mx: 0.5,
                    },
                }}
            />

            <Button
                fullWidth
                variant="contained"
                disabled={isLoading || iin.length !== 12}
                onClick={onCheck}
                sx={{
                    ...primaryButtonStyles,
                    mt: 1.5,
                }}
            >
                {isLoading ? (
                    <CircularProgress size={23} color="inherit" />
                ) : (
                    t("iinCheckForm.actions.check")
                )}
            </Button>
        </Box>
    );
};
