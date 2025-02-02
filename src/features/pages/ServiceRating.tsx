import { useState, ChangeEvent } from "react";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Rating from "@mui/material/Rating";
import { useTranslation } from "react-i18next";
import { SULogoM } from "src/assets";
import theme from "src/styles/theme";
import { VALIDATION_RULES } from "src/config/validationConfig";
import CustomButton from "src/components/Button";

const BackgroundContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(5),
}));

const FormContainer = styled(Stack)(({ theme }) => ({
    width: "100%",
    maxWidth: theme.spacing(50),
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[2],
    textAlign: "center",
}));

const ServiceRating = () => {
    const { t } = useTranslation();
    const [rating, setRating] = useState<number>(0);
    const [feedback, setFeedback] = useState<string>("");

    const handleFeedbackChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= VALIDATION_RULES.MAX_FEEDBACK_LENGTH) {
            setFeedback(value);
        }
    };

    const handleSubmit = () => {
        console.log(`Рейтинг: ${rating}`);
        if (feedback.trim()) {
            alert("Not Implemented");
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
                    {`${feedback.length}/${VALIDATION_RULES.MAX_FEEDBACK_LENGTH} ${t("i18n_queue.characters")}`}
                </Typography>

                <CustomButton
                    fullWidth
                    variantType="primary"
                    sx={{ mt: 2 }}
                    disabled={rating === 0}
                    onClick={handleSubmit}
                >
                    {t("i18n_queue.submit")}
                </CustomButton>
            </FormContainer>
        </BackgroundContainer>
    );
};

export default ServiceRating;
