import { styled } from "@mui/material";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import { NotFoundPageIcon } from "src/assets";
import CustomButton from "src/components/Button";

const NotFoundBoxStyle = styled(Box)({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
});
const handleGoBack = () => {
    window.history.back();
};

const NotFound = () => {
    const { t } = useTranslation();

    return (
        <>
            <NotFoundBoxStyle>
                <NotFoundPageIcon />
                <Box>
                    <CustomButton
                        variantType="primary"
                        fullWidth
                        onClick={handleGoBack}
                    >
                        {t("i18n_queue.goBack")}
                    </CustomButton>
                </Box>
            </NotFoundBoxStyle>
        </>
    );
};

export default NotFound;
