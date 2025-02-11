import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setServiceId } from "src/store/userSlice";
import { RootState } from "src/store/store";
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
import CustomButton from "src/components/Button";
import Skeleton from "@mui/material/Skeleton";
import {
    useGetServiceListQuery,
    useCreateRecordMutation,
} from "src/store/managerApi";
import { useNavigate } from "react-router-dom";
import { setToken } from "src/store/userAuthSlice";

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
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [search, setSearch] = useState("");
    const { data, error, isLoading } = useGetServiceListQuery();
    const [createRecord] = useCreateRecordMutation();
    const [selectedService, setSelectedService] = useState<Service | null>(
        null
    );

    const userInfo = useSelector((state: RootState) => state.user.userInfo);

    const services: Service[] = Array.isArray(data?.value)
        ? data.value.map((service: any) => ({
              id: service.serviceId,
              name: service.nameRu,
          }))
        : [];

    const filteredServices = services.filter((service) =>
        service.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = async () => {
        if (!selectedService) {
            alert("Услуга не выбрана");
            return;
        }

        if (!userInfo) {
            alert("Ошибка: данные пользователя отсутствуют");
            return;
        }

        dispatch(setServiceId(selectedService.id));

        try {
            const response = await createRecord({
                ...userInfo,
                serviceId: selectedService.id,
            }).unwrap();

            if (response.token) {
                localStorage.setItem("token", response.token);
                dispatch(setToken(response.token));
                navigate("/wait");
            } else {
                alert("Ошибка: не получен токен");
            }
        } catch (error) {
            alert("Ошибка создания записи");
        }
    };

    return (
        <BackgroundContainer>
            <Box sx={{ paddingBottom: theme.spacing(5) }}>
                <SULogoM />
            </Box>
            <FormContainer>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{ textAlign: "center", marginBottom: 2 }}
                >
                    {t("i18n_queue.chooseService")}
                </Typography>

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

                {isLoading ? (
                    <Paper sx={{ padding: 2 }}>
                        <Skeleton variant="text" width="60%" height={32} />
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                variant="rectangular"
                                width="100%"
                                height={18}
                                sx={{ mt: 1 }}
                            />
                        ))}
                    </Paper>
                ) : error ? (
                    <Typography color="error">
                        {t("i18n_queue.loadingError")}
                    </Typography>
                ) : (
                    <Paper>
                        <ServiceList
                            services={filteredServices}
                            selectedService={selectedService}
                            onSelect={setSelectedService}
                        />
                    </Paper>
                )}

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
