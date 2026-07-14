import {
    Box,
    Button,
    CircularProgress,
    TextField,
    Typography,
} from "@mui/material";
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
    return (
        <Box>
            <Typography
                sx={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#111827",
                    mb: 0.7,
                }}
            >
                Проверка заявки
            </Typography>

            <Typography
                sx={{
                    mb: 2.5,
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: "#6b7280",
                }}
            >
                Введите ИИН, чтобы проверить наличие активной заявки.
            </Typography>

            <TextField
                fullWidth
                label="ИИН"
                value={iin}
                placeholder="Введите 12 цифр"
                disabled={isLoading}
                error={Boolean(error)}
                helperText={error || `${iin.length}/12`}
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
                    "Проверить"
                )}
            </Button>
        </Box>
    );
};
