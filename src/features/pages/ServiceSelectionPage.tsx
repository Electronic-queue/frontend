// src/features/pages/ServiceSelection.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setServiceId } from "src/store/userSlice";
import { RootState } from "src/store/store";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
// 1. Импортируем useTheme
import { styled, useTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
// 2. Импортируем оба логотипа
import { SULogoM, SULogoMDark } from "src/assets";
import { useTranslation } from "react-i18next";
import ServiceList, { Service } from "src/widgets/serviceList/ui/ServiceList";
// УДАЛЕНО: import theme from "src/styles/theme";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import CustomButton from "src/components/Button";
import Skeleton from "@mui/material/Skeleton";
import { useCreateRecordMutation } from "src/store/userApi";

import { useNavigate } from "react-router-dom";
import { setRecordId, setToken } from "src/store/userAuthSlice";
import i18n from "src/i18n";
import { useGetServiceListMutation } from "src/store/managerApi";

const BackgroundContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(2),
}));

const FormContainer = styled(Stack)(({ theme }) => ({
    width: "100%",
    maxWidth: theme.spacing(50),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[2],
}));

const ServiceSelection = () => {
    // 3. Активируем хук темы
    const theme = useTheme();

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const queueTypeId = useSelector(
        (state: RootState) => state.user.queueTypeId
    );

    const { t } = useTranslation();
    const currentLanguage = i18n.language || "ru";
    const [search, setSearch] = useState("");
    const [getServiceList, { data, error, isLoading }] =
        useGetServiceListMutation();
    const [createRecord] = useCreateRecordMutation();
    const [selectedService, setSelectedService] = useState<Service | null>(
        null
    );

    const userInfo = useSelector(
        (state: RootState) => (state.user as any).userInfo
    );
    const userFcmToken = useSelector(
        (state: RootState) => (state.user as any).fcmToken
    );

    const services: Service[] = Array.isArray(data)
        ? data.map((service: any) => ({
            id: service.serviceId,
            name:
                currentLanguage === "kz"
                    ? service.nameKk
                    : currentLanguage === "en"
                        ? service.nameEn
                        : service.nameRu,
            description:
                currentLanguage === "kz"
                    ? service.descriptionKk
                    : currentLanguage === "en"
                        ? service.descriptionEn
                        : service.descriptionRu,
        }))
        : [];
    const filteredServices = services.filter((service) =>
        service.name.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        if (queueTypeId) {
            getServiceList(queueTypeId);
        }
    }, [queueTypeId, getServiceList]);

    const handleSubmit = async () => {
        if (!selectedService) {
            alert("Услуга не выбрана");
            return;
        }

        if (!userInfo) {
            alert("Ошибка: данные пользователя не заполнены, вернитесь назад");
            return;
        }

        dispatch(setServiceId(selectedService.id as any));
        const BACKEND_LIMIT_REACHED = "Лимит по услуге достигнут.";
        const LIMIT_EXCEEDED_MESSAGE =
            "Запись на сегодня завершена.\n\nК сожалению, свободные места на выбранную услугу закончились. Пожалуйста, попробуйте записаться завтра.";
        const BACKEND_OUT_OF_WORKING_HOURS =
            "Ожидание за пределами рабочего времени.";
        const NO_MANAGERS_REGEX =
            /Менеджеры, которые занимаются услугой/;
        const NO_MANAGERS_MESSAGE =
            "В данный момент все менеджеры временно недоступны.\n\nПожалуйста, попробуйте записаться позже.";

        const MANAGER_WORK_TIME_MESSAGE =
            "Менеджеры еще не начали работу.\n\nГрафик работы: с 09:00 до 18:00.\nПожалуйста, попробуйте записаться позже.";

        const LABORATORY_SERVICE_ID = "166fbb61-32ec-492a-e844-08de268f0d54";
        const BACKEND_TIMEOUT_MESSAGE =
            "время ожидания вышло за рамки рабочих часов";
        const CUSTOM_LAB_MESSAGE =
            "Время приема завершено. Лаборатория работает с 8:00 до 11:00";
        try {
            const response = await createRecord({
                ...userInfo,
                serviceId: selectedService.id,
                fcmToken: userFcmToken,
            }).unwrap();

            if (response.token) {
                localStorage.setItem("token", response.token);
                dispatch(setToken(response.token));
                dispatch(setRecordId(null));
                localStorage.removeItem("recordId");
                localStorage.setItem(
                    "selectedService",
                    JSON.stringify(selectedService)
                );
                navigate("/wait");
            } else {
                alert("Ошибка: не получен токен, попробуйте снова");
            }
        } catch (error: any) {
            const backendErrorDetail = error?.data?.detail;
            console.log("backendErrorDetail:", backendErrorDetail);

            let message = "Ошибка создания записи, попробуйте снова";

            // 1. Проверка лимита (Добавляем это первым или после лаборатории)
            if (backendErrorDetail === BACKEND_LIMIT_REACHED) {
                message = LIMIT_EXCEEDED_MESSAGE;
            }
            // 🧪 Лаборатория
            else if (
                selectedService?.id === LABORATORY_SERVICE_ID &&
                backendErrorDetail === BACKEND_TIMEOUT_MESSAGE
            ) {
                message = CUSTOM_LAB_MESSAGE;
            }
            // ⏰ ВНЕ РАБОЧЕГО ВРЕМЕНИ
            else if (backendErrorDetail === BACKEND_OUT_OF_WORKING_HOURS) {
                message = MANAGER_WORK_TIME_MESSAGE;
            }
            // ⏸️ ВСЕ МЕНЕДЖЕРЫ НА ПАУЗЕ / ОТСУТСТВУЮТ
            else if (
                backendErrorDetail &&
                NO_MANAGERS_REGEX.test(backendErrorDetail)
            ) {
                message = NO_MANAGERS_MESSAGE;
            }
            // 🧯 ФОЛБЭК
            else if (backendErrorDetail) {
                message = backendErrorDetail;
            }

            alert(message);
        }


    };

    useEffect(() => {
        const savedService = localStorage.getItem("selectedService");
        if (savedService) {
            setSelectedService(JSON.parse(savedService));
        }
    }, []);

    return (
        <BackgroundContainer>
            <Box>
                {/* 4. Смена логотипа */}
                {theme.palette.mode === 'dark' ? <SULogoMDark /> : <SULogoM />}
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