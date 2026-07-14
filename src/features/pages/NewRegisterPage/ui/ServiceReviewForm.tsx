import { useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Rating,
    TextField,
    Typography,
} from "@mui/material";

import { ActiveRequest } from "../model/types";

interface ServiceReviewFormProps {
    data: ActiveRequest;
    isSubmitting: boolean;
    error: string;
    onSubmit: (
        rating: number,
        comment: string
    ) => Promise<void> | void;
    onSkip: () => void;
}

export const ServiceReviewForm = ({
    data,
    isSubmitting,
    error,
    onSubmit,
    onSkip,
}: ServiceReviewFormProps) => {
    const [rating, setRating] =
        useState<number | null>(null);

    const [comment, setComment] =
        useState("");

    const handleSubmit = async () => {
        if (!rating || isSubmitting) {
            return;
        }

        await onSubmit(
            rating,
            comment.trim()
        );
    };

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 76,
                    height: 76,
                    mx: "auto",
                    mb: 2.2,
                    borderRadius: "24px",
                    color: "#ffffff",
                    background:
                        "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                    boxShadow:
                        "0 14px 30px rgba(109, 40, 217, 0.24)",
                }}
            >
                <Typography
                    sx={{
                        fontSize: 38,
                        lineHeight: 1,
                    }}
                >
                    ★
                </Typography>
            </Box>

            <Typography
                sx={{
                    textAlign: "center",
                    fontSize: 24,
                    fontWeight: 850,
                    color: "#111827",
                    lineHeight: 1.25,
                }}
            >
                Обслуживание завершено
            </Typography>

            <Typography
                sx={{
                    mt: 0.8,
                    textAlign: "center",
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: "#64748b",
                }}
            >
                Оцените качество полученной услуги
            </Typography>

            <Box
                sx={{
                    mt: 2.5,
                    p: 1.8,
                    borderRadius: "17px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #edf1f6",
                }}
            >
                <Typography
                    sx={{
                        fontSize: 12,
                        color: "#64748b",
                    }}
                >
                    Услуга
                </Typography>

                <Typography
                    sx={{
                        mt: 0.4,
                        fontSize: 15,
                        fontWeight: 750,
                        color: "#111827",
                        lineHeight: 1.4,
                    }}
                >
                    {data.serviceNameRu ||
                        "Название услуги не указано"}
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        mt: 1.5,
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 12,
                            color: "#64748b",
                        }}
                    >
                        Талон №{data.ticketNumber}
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: 12,
                            color: "#64748b",
                        }}
                    >
                        Заявка #{data.recordId}
                    </Typography>
                </Box>
            </Box>

            <Box
                sx={{
                    mt: 2.7,
                    textAlign: "center",
                }}
            >
                <Typography
                    sx={{
                        mb: 1.2,
                        fontSize: 14,
                        fontWeight: 750,
                        color: "#334155",
                    }}
                >
                    Ваша оценка
                </Typography>

                <Rating
                    value={rating}
                    disabled={isSubmitting}
                    size="large"
                    onChange={(_, newValue) => {
                        setRating(newValue);
                    }}
                    sx={{
                        fontSize: 46,
                    }}
                />

                <Typography
                    sx={{
                        mt: 0.8,
                        minHeight: 20,
                        fontSize: 13,
                        fontWeight: 650,
                        color: "#64748b",
                    }}
                >
                    {rating === 1 && "Очень плохо"}
                    {rating === 2 && "Плохо"}
                    {rating === 3 && "Нормально"}
                    {rating === 4 && "Хорошо"}
                    {rating === 5 && "Отлично"}
                </Typography>
            </Box>

            <TextField
                fullWidth
                multiline
                minRows={4}
                label="Комментарий"
                placeholder="Расскажите о качестве обслуживания"
                value={comment}
                disabled={isSubmitting}
                onChange={(event) => {
                    setComment(event.target.value);
                }}
                inputProps={{
                    maxLength: 500,
                }}
                helperText={`${comment.length}/500`}
                sx={{
                    mt: 2.2,

                    "& .MuiOutlinedInput-root": {
                        borderRadius: "16px",
                    },

                    "& .MuiFormHelperText-root": {
                        mx: 0.5,
                        textAlign: "right",
                    },
                }}
            />

            {error && (
                <Box
                    sx={{
                        mt: 1.5,
                        p: 1.5,
                        borderRadius: "14px",
                        backgroundColor: "#fef2f2",
                        border: "1px solid #fecaca",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 13,
                            fontWeight: 650,
                            lineHeight: 1.5,
                            color: "#b91c1c",
                        }}
                    >
                        {error}
                    </Typography>
                </Box>
            )}

            <Button
                fullWidth
                variant="contained"
                disabled={!rating || isSubmitting}
                onClick={() => {
                    void handleSubmit();
                }}
                sx={{
                    mt: 2,
                    minHeight: 52,
                    borderRadius: "14px",
                    textTransform: "none",
                    fontSize: 15,
                    fontWeight: 750,
                    background:
                        "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                    boxShadow:
                        "0 10px 22px rgba(109, 40, 217, 0.22)",

                    "&:hover": {
                        background:
                            "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
                    },

                    "&.Mui-disabled": {
                        background: "#ddd6fe",
                        color: "#ffffff",
                    },
                }}
            >
                {isSubmitting ? (
                    <CircularProgress
                        size={23}
                        color="inherit"
                    />
                ) : (
                    "Отправить оценку"
                )}
            </Button>

            <Button
                fullWidth
                disabled={isSubmitting}
                onClick={onSkip}
                sx={{
                    mt: 1,
                    minHeight: 44,
                    borderRadius: "13px",
                    textTransform: "none",
                    fontWeight: 700,
                    color: "#64748b",
                }}
            >
                Пропустить
            </Button>
        </Box>
    );
};