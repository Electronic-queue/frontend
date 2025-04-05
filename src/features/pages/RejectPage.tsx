import { useCallback } from "react";
import { Typography } from "@mui/material";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import { SULogoM } from "src/assets";
import theme from "src/styles/theme";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import CustomButton from "src/components/Button";
import {
    setRecordId,
    setTicketNumber,
    setToken,
} from "src/store/userAuthSlice";

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

const RejectPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleConfirmRefuse = useCallback(async () => {
        localStorage.removeItem("token");
        localStorage.removeItem("recordId");
        localStorage.removeItem("ticketNumber");
        dispatch(setTicketNumber(null));
        dispatch(setToken(null));
        dispatch(setRecordId(null));
        navigate("/");
    }, [dispatch, navigate]);

    return (
        <BackgroundContainer>
            <Box sx={{ paddingBottom: theme.spacing(5) }}>
                <SULogoM />
            </Box>
            <FormContainer>
                <Typography sx={{ fontSize: theme.typography.h5.fontSize }}>
                    {t("i18n_queue.beingReject")}
                </Typography>
            </FormContainer>
            <Box sx={{ paddingTop: theme.spacing(5) }}>
                <CustomButton
                    variantType="danger"
                    fullWidth
                    onClick={handleConfirmRefuse}
                >
                    {t("i18n_queue.refuse")}
                </CustomButton>
            </Box>
        </BackgroundContainer>
    );
};

export default RejectPage;
