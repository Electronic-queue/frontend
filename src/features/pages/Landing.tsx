import { Typography } from "@mui/material";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import { StudentsIcon, SULogoM } from "src/assets";
import { useDispatch } from "react-redux";
import { setQueueTypeId } from "src/store/userAuthSlice";
import theme from "src/styles/theme";
import { useNavigate } from "react-router-dom";
import { useGetQueueTypeQuery } from "src/store/managerApi";
import CustomButton from "src/components/Button";
import i18n from "src/i18n";

const BackgroundContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(to left, #ADD8E6, white 50%)",
    paddingTop: theme.spacing(-5),
}));
const FormContainer = styled(Stack)(({ theme }) => ({
    position: "relative",
    width: "95%",
    height: "565px",
    maxWidth: theme.spacing(50),
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[2],
    overflow: "hidden",
    zIndex: 1,
}));

const BlurBackground = styled(Box)(({ theme }) => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.spacing(2),
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(36, 34, 207, 0.18)",
    backdropFilter: "blur(8px)",
    zIndex: 0,
}));

const Landing = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        data: queueTypeData,
        isLoading: isQueueLoading,
        error: queueError,
    } = useGetQueueTypeQuery();

    const handleSelectQueueType = (queueTypeId: string) => {
        dispatch(setQueueTypeId(queueTypeId));
        navigate("/register");
    };

    const currentLanguage = i18n.language || "ru";

    return (
        <BackgroundContainer>
            <Box
                sx={{
                    marginBottom: theme.spacing(-1.3),
                }}
            >
                <StudentsIcon />
            </Box>

            <FormContainer>
                <BlurBackground />

                <Box
                    sx={{
                        paddingBottom: theme.spacing(5),
                        zIndex: 1,
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <SULogoM />
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: theme.spacing(2),
                        zIndex: 1,
                    }}
                >
                    {isQueueLoading && (
                        <Typography variant="body1">
                            {t("loading")}...
                        </Typography>
                    )}

                    {queueError && (
                        <Typography variant="body2" color="error">
                            {t("failed_to_load_data")}
                        </Typography>
                    )}

                    {[...(queueTypeData?.value || [])]
                        .reverse()
                        .map((queueType: any) => (
                            <CustomButton
                                key={queueType.queueTypeId}
                                variantType="primary"
                                onClick={() =>
                                    handleSelectQueueType(queueType.queueTypeId)
                                }
                            >
                                {currentLanguage === "ru"
                                    ? queueType.nameRu
                                    : currentLanguage === "en"
                                      ? queueType.nameEn
                                      : queueType.nameKk}
                            </CustomButton>
                        ))}
                </Box>
            </FormContainer>
        </BackgroundContainer>
    );
};

export default Landing;
