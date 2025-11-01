import { useState, ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RootState } from "src/store/store";
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
import { useCreateReviewMutation } from "src/store/managerApi";
import {
    useGetClientRecordByIdQuery,
    useGetRecordIdByTokenQuery,
} from "src/store/userApi";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Button from "@mui/material/Button";
import { useDispatch, useSelector } from "react-redux";
import {
    setRecordId,
    setTicketNumber,
    setToken,
} from "src/store/userAuthSlice";
import { CheckMarkIcon } from "src/assets";

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

interface ClientRecord {
    recordId: number;
    windowNumber: number;
    nameRu: string;
    nameKk: string;
    nameEn: string;
    clientNumber: number;
    expectedAcceptanceTime: string;
    ticketNumber: number;
}

const ServiceRating = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const recordId1 = useSelector((state: RootState) => state.user.recordId);
    const [rating, setRating] = useState<number>(0);
    const [feedback, setFeedback] = useState<string>("");
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [dialogMessage, setDialogMessage] = useState<string>("");
    const [recordData, setRecordData] = useState<ClientRecord | null>(null);

    const [createReview, { isLoading }] = useCreateReviewMutation();
    const { data: tokenData, refetch } = useGetRecordIdByTokenQuery();
    const recordId = tokenData?.recordId ?? null;
    const [selectedService, setSelectedService] = useState<{
        description: string;
    } | null>(null);

    useEffect(() => {
        const savedService = localStorage.getItem("selectedService");
        if (savedService) {
            try {
                setSelectedService(JSON.parse(savedService));
            } catch {
                console.error(
                    "Ошибка при чтении selectedService из localStorage"
                );
            }
        }
    }, []);

    const { data: clientRecord } = useGetClientRecordByIdQuery(recordId1 ?? 0, {
        skip: !recordId1,
    });
    console.log("Fetched Client Record:", clientRecord);
    useEffect(() => {
        if (clientRecord) {
            setRecordData(clientRecord);
        }
    }, [clientRecord]);

    useEffect(() => {
        refetch();
    }, []);

    const handleFeedbackChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= VALIDATION_RULES.MAX_FEEDBACK_LENGTH) {
            setFeedback(value);
        }
    };

    const handleSubmit = async () => {
        if (!recordId) {
            setDialogMessage(t("i18n_queue.reviewError"));
            setDialogOpen(true);
            return;
        }

        try {
            await createReview({
                recordId,
                rating,
                content: feedback,
            }).unwrap();

            setDialogMessage(t("i18n_queue.reviewSubmitted"));
            setDialogOpen(true);
            setRating(0);
            setFeedback("");
        } catch (error) {
            setDialogMessage(t("i18n_queue.reviewError"));
            setDialogOpen(true);
        }
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        navigate("/");
        localStorage.removeItem("token");
        dispatch(setToken(null));
        localStorage.removeItem("recordId");
        localStorage.removeItem("ticketNumber");
        dispatch(setTicketNumber(null));
        dispatch(setRecordId(null));
    };

    return (
        <BackgroundContainer>
            <Box sx={{ paddingBottom: theme.spacing(5) }}>
                <SULogoM />
            </Box>
            <FormContainer>
                <Typography
                    variant="h5"
                    sx={{ marginBottom: 2, color: theme.palette.text.primary }}
                >
                    {t("i18n_queue.rateService")}
                </Typography>
                <Box>
                    <Box
                        sx={{
                            marginBottom: 2,
                            backgroundColor: "#F0F4FF",
                            borderRadius: theme.spacing(1),
                        }}
                    >
                        {selectedService && (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    paddingRight: 2,
                                    paddingLeft: 2,
                                    paddingTop: 1,
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        marginBottom: 1,
                                        color: "#929294ff",
                                    }}
                                >
                                    Услуга:
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{ marginBottom: 1 }}
                                >
                                    {selectedService.description}
                                </Typography>
                            </Box>
                        )}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingRight: 2,
                                paddingLeft: 2,
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{ marginBottom: 1, color: "#929294ff" }}
                            >
                                Окно:
                            </Typography>
                            <Typography variant="h6">
                                {t("i18n_queue.window")}:{" "}
                                {recordData?.windowNumber ?? "—"}
                            </Typography>{" "}
                        </Box>
                    </Box>
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
                    disabled={rating === 0 || isLoading}
                    onClick={handleSubmit}
                >
                    {t("i18n_queue.submit")}
                </CustomButton>
            </FormContainer>

            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                <DialogContent>
                    <DialogContentText>{dialogMessage}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} autoFocus>
                        {t("i18n_queue.complete")}
                    </Button>
                </DialogActions>
            </Dialog>
        </BackgroundContainer>
    );
};

export default ServiceRating;
