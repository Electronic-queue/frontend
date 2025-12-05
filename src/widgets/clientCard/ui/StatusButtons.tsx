import { FC, useState } from "react";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import CustomButton from "../../../components/Button";
import ReusableModal from "../../../components/ModalPage";
import CustomSearchInput from "../../../components/SearchInput";
import SearchIcon from "@mui/icons-material/Search";
import ReusableTable from "src/components/Table";
import theme from "src/styles/theme";
import { styled } from "@mui/material/styles";
import {
    useRedirectClientMutation,
    useGetServicesForManagerMutation,
} from "src/store/managerApi";
import { Alert, Snackbar, CircularProgress } from "@mui/material";
import { Service } from "src/widgets/serviceList/ui/ServiceList";
import i18n from "src/i18n";

// --- Интерфейсы ---

interface StatusButtonsProps {
    status: string;
    callNext: () => void;
    onAccept: () => void;
    onComplete: () => void;
    onRedirect: (serviceIdRedirect: number) => void;
    isLoading: boolean; // 👈 Флаг загрузки от родителя
}

// --- Стили ---

const MainWrapper = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
}));

const ButtonWrapperStyles = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(2),
    justifyContent: "flex-end",
}));

// Обертка для контента кнопки (текст или спиннер), чтобы центрировать их
const ButtonContent = styled(Box)({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%", 
});

const currentLanguage = i18n.language || "ru";

// --- Компоненты Кнопок ---

// 1. Кнопка "Вызвать следующего" (Idle)
const IdleButton: FC<{ callNext: () => void; isLoading: boolean }> = ({ callNext, isLoading }) => {
    const { t } = useTranslation();
    return (
        <CustomButton 
            variantType="primary" 
            sizeType="small" 
            onClick={callNext}
            disabled={isLoading} // Блокировка
        >
            <ButtonContent>
                {isLoading ? <CircularProgress size={20} color="inherit" /> : t("i18n_queue.callNext")}
            </ButtonContent>
        </CustomButton>
    );
};

// 2. Кнопки "Принять" и "Перенаправить" (Called)
const CalledButtons: FC<{
    onAccept: () => void;
    onRedirect: (serviceIdRedirect: number) => void;
    isLoading: boolean; // Global loading state (для кнопки Accept)
}> = ({ onAccept, onRedirect, isLoading }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
    });
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
        null
    );

    // API Hooks
    const [getServicesForManager, { data, error, isLoading: isServicesLoading }] =
        useGetServicesForManagerMutation();

    const [redirectClient, { isLoading: isRedirecting }] = useRedirectClientMutation();

    const handleOpen = async () => {
        try {
            await getServicesForManager().unwrap();
            setIsOpen(true);
        } catch (err) {
            console.error("Ошибка загрузки услуг:", err);
        }
    };

    const handleRedirect = async () => {
        if (!selectedServiceId) {
            console.warn("Не выбрана услуга!");
            return;
        }
        try {
            await redirectClient({ serviceId: selectedServiceId }).unwrap();
            onRedirect(selectedServiceId);
            setIsOpen(false);
            setSnackbar({
                open: true,
                message: t("i18n_queue.serviceRedirected"),
            });
        } catch (error) {
            console.error("Ошибка перенаправления клиента:", error);
        }
    };

    const services: Service[] = Array.isArray(data)
        ? data.map((service: any, index: number) => ({
              id: service.serviceId,
              displayId: index + 1,
              name:
                  currentLanguage === "kz"
                      ? service.nameKk
                      : currentLanguage === "en"
                      ? service.nameEn
                      : service.nameRu,
          }))
        : [];

    const filteredData = services.filter((service) =>
        service.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
        <Box sx={{ display: "flex", gap: theme.spacing(2) }}>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ open: false, message: "" })}
            >
                <Alert
                    severity="success"
                    onClose={() => setSnackbar({ open: false, message: "" })}
                    sx={{ fontSize: theme.typography.body1.fontSize }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Кнопка открытия модалки перенаправления */}
            <CustomButton
                variantType="primary"
                sizeType="small"
                onClick={handleOpen}
                disabled={isLoading} // Блокируем если идет "Принятие"
            >
                {t("i18n_queue.redirect")}
            </CustomButton>

            <ReusableModal
                open={isOpen}
                onClose={() => setIsOpen(false)}
                title={t("i18n_queue.redirectService")}
                width={theme.spacing(99)}
                showCloseButton={false}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: theme.spacing(2),
                    }}
                >
                    <CustomSearchInput
                        placeholder={t("i18n_queue.searchServicePlaceholder")}
                        icon={<SearchIcon style={{ color: "#667085" }} />}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        width={theme.spacing(87)}
                        height={theme.spacing(6)}
                        borderColor={theme.palette.lightBlueGray.main}
                        borderRadius={theme.shape.borderRadius}
                        backgroundColor={theme.palette.lightGray.main}
                        iconPosition="left"
                    />

                    {isServicesLoading ? (
                        <Box display="flex" justifyContent="center" p={2}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <p>Ошибка загрузки данных</p>
                    ) : (
                        <MainWrapper>
                            <ReusableTable
                                data={filteredData}
                                columns={[
                                    { accessorKey: "displayId", header: "№" },
                                    {
                                        accessorKey: "name",
                                        header: t("i18n_queue.serviceName"),
                                    },
                                ]}
                                pageSize={5}
                                onRowClick={(row) =>
                                    setSelectedServiceId(row.id)
                                }
                            />
                            <ButtonWrapperStyles>
                                <CustomButton onClick={() => setIsOpen(false)}>
                                    {t("i18n_queue.cancel")}
                                </CustomButton>
                                <CustomButton
                                    onClick={handleRedirect}
                                    disabled={!selectedServiceId || isRedirecting} // Блокировка кнопки внутри модалки
                                >
                                    <ButtonContent>
                                        {isRedirecting ? (
                                            <CircularProgress size={20} color="inherit" />
                                        ) : (
                                            t("i18n_queue.redirectServiceAction")
                                        )}
                                    </ButtonContent>
                                </CustomButton>
                            </ButtonWrapperStyles>
                        </MainWrapper>
                    )}
                </Box>
            </ReusableModal>

            {/* Кнопка "Принять" */}
            <CustomButton
                variantType="primary"
                sizeType="small"
                onClick={onAccept}
                disabled={isLoading} // Блокировка при загрузке
            >
                <ButtonContent>
                    {isLoading ? <CircularProgress size={20} color="inherit" /> : t("i18n_queue.accept")}
                </ButtonContent>
            </CustomButton>
        </Box>
    );
};

// --- Основной компонент ---

const StatusButtons: FC<StatusButtonsProps> = ({
    status,
    callNext,
    onAccept,
    onComplete,
    onRedirect,
    isLoading, // 👈 Принимаем проп
}) => {
    const { t } = useTranslation();

    switch (status) {
        case "idle":
            return <IdleButton callNext={callNext} isLoading={isLoading} />;
        case "called":
            return (
                <CalledButtons 
                    onAccept={onAccept} 
                    onRedirect={onRedirect} 
                    isLoading={isLoading} 
                />
            );
        case "accepted":
            return (
                <CustomButton
                    variantType="primary"
                    sizeType="small"
                    onClick={onComplete}
                    disabled={isLoading} // Блокировка
                >
                    <ButtonContent>
                        {isLoading ? <CircularProgress size={20} color="inherit" /> : t("i18n_queue.complete")}
                    </ButtonContent>
                </CustomButton>
            );
        default:
            return null;
    }
};

export default StatusButtons;