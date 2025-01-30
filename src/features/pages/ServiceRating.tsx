import { useState, ChangeEvent } from "react";
import { Button, Typography, TextField, Rating } from "@mui/material";
import { Box, Stack, styled } from "@mui/system";
import { useTranslation } from "react-i18next";
import { SULogoM } from "src/assets";
import theme from "src/styles/theme";

const MAX_FEEDBACK_LENGTH = 150;

const BackgroundContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.background.default,
    paddingTop: "34px",
}));

const FormContainer = styled(Stack)(({ theme }) => ({
    width: "100%",
    maxWidth: theme.spacing(50),
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    boxShadow: "2px 4px 10px rgba(0, 0, 0, 0.25)",
    textAlign: "center",
}));

const ServiceRating = () => {
    const { t } = useTranslation();
    const [rating, setRating] = useState<number>(0);
    const [feedback, setFeedback] = useState<string>("");

    const handleFeedbackChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= MAX_FEEDBACK_LENGTH) {
            setFeedback(value);
        }
    };

    return (
        <BackgroundContainer>
            <Box sx={{ paddingBottom: theme.spacing(5) }}>
                <SULogoM />
            </Box>
            <FormContainer>
                <Typography variant="h5" sx={{ marginBottom: 2 }}>
                    {t("i18n_queue.rateService")}
                </Typography>
                <Box>
                    <Rating
                        value={rating}
                        onChange={(event, newValue) =>
                            setRating(newValue !== null ? newValue : 0)
                        }
                        size="large"
                        sx={{ marginBottom: 2 }}
                    />
                </Box>
                <TextField
                    label={t("i18n_queue.leaveFeedback")}
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    value={feedback}
                    onChange={handleFeedbackChange}
                    sx={{ marginBottom: 1 }}
                />
                <Typography variant="caption" color="textSecondary">
                    {`${feedback.length}/${MAX_FEEDBACK_LENGTH} ${t("i18n_queue.characters")}`}
                </Typography>

                <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 2 }}
                    disabled={rating === 0}
                >
                    {t("i18n_queue.submit")}
                </Button>
            </FormContainer>
        </BackgroundContainer>
    );
};

export default ServiceRating;
