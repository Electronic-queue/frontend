import { useState } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import { SULogoM } from "src/assets";
import { useTranslation } from "react-i18next";
import ServiceList, { Service } from "src/widgets/serviceList/ui/ServiceList";
import theme from "src/styles/theme";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import MockServiceList from "src/components/mock/MockServiceList.json";
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
}));

const ServiceSelection = () => {
    const { t } = useTranslation();
    const [search, setSearch] = useState("");
    const [selectedService, setSelectedService] = useState<Service | null>(
        null
    );

    const filteredServices = MockServiceList.filter((service) =>
        service.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = () => {
        if (selectedService) {
            console.log("Selected Service :", selectedService.id);
        } else {
            console.log("No service selected");
        }
    };

    return (
        <BackgroundContainer>
            <Box sx={{ paddingBottom: theme.spacing(5) }}>
                <SULogoM />
            </Box>
            <FormContainer>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{ marginBottom: 2 }}
                    >
                        {t("i18n_queue.chooseService")}
                    </Typography>
                </Box>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder={t("i18n_queue.searchService")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                <Paper>
                    <ServiceList
                        services={filteredServices}
                        selectedService={selectedService}
                        onSelect={setSelectedService}
                    />
                </Paper>
                <CustomButton
                    fullWidth
                    variantType="primary"
                    sx={{ mt: 2 }}
                    disabled={!selectedService}
                    onClick={handleSubmit}
                >
                    {t("i18n_queue.signUp")}
                </CustomButton>
            </FormContainer>
        </BackgroundContainer>
    );
};

export default ServiceSelection;
