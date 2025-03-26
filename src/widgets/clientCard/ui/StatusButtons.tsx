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
    useGetServiceListQuery,
    useRedirectClientMutation,
} from "src/store/managerApi";

import { t } from "i18next";
import { Alert, Snackbar } from "@mui/material";
import { Service } from "src/widgets/serviceList/ui/ServiceList";
import i18n from "src/i18n";

interface StatusButtonsProps {
    status: string;
    callNext: () => void;
    onAccept: () => void;
    onComplete: () => void;
    onRedirect: (serviceIdRedirect: number) => void;
}

const IdleButton: FC<{ callNext: () => void }> = ({ callNext }) => {
    const { t } = useTranslation();
    return (
        <CustomButton variantType="primary" sizeType="small" onClick={callNext}>
            {t("i18n_queue.callNext")}
        </CustomButton>
    );
};

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
const currentLanguage = i18n.language || "ru";
const CalledButtons: FC<{
    onAccept: () => void;
    onRedirect: (serviceIdRedirect: number) => void;
}> = ({ onAccept, onRedirect }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
    }>({ open: false, message: "" });
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
        null
    );
    const { refetch } = useGetServiceListQuery();
    const { data, error, isLoading } = useGetServiceListQuery();
    const [redirectClient] = useRedirectClientMutation();
    const handleRedirect = async () => {
        if (!selectedServiceId) {
            console.warn("Не выбрана услуга!");
            return;
        }
        try {
            const response = await redirectClient({
                serviceId: selectedServiceId,
            }).unwrap();
            refetch();
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

    const services: Service[] = Array.isArray(data?.value)
        ? data.value.map((service: any) => ({
              id: service.serviceId,
              name:
                  currentLanguage === "kz"
                      ? service.nameKk
                      : currentLanguage === "en"
                        ? service.nameEn
                        : service.nameRu,
          }))
        : [];

    const filteredData = services.filter((service: { name: string }) =>
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
            <CustomButton
                variantType="primary"
                sizeType="small"
                onClick={() => setIsOpen(true)}
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

                    {isLoading ? (
                        <p>Загрузка...</p>
                    ) : error ? (
                        <p>Ошибка загрузки данных</p>
                    ) : (
                        <MainWrapper>
                            <ReusableTable
                                data={filteredData}
                                columns={[
                                    { accessorKey: "id", header: "№" },
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
                                    disabled={!selectedServiceId}
                                >
                                    {t("i18n_queue.redirectServiceAction")}
                                </CustomButton>
                            </ButtonWrapperStyles>
                        </MainWrapper>
                    )}
                </Box>
            </ReusableModal>

            <CustomButton
                variantType="primary"
                sizeType="small"
                onClick={onAccept}
            >
                {t("i18n_queue.accept")}
            </CustomButton>
        </Box>
    );
};

const StatusButtons: FC<StatusButtonsProps> = ({
    status,
    callNext,
    onAccept,
    onComplete,
    onRedirect,
}) => {
    switch (status) {
        case "idle":
            return <IdleButton callNext={callNext} />;

        case "called":
            return (
                <CalledButtons onAccept={onAccept} onRedirect={onRedirect} />
            );
        case "accepted":
            return (
                <CustomButton
                    variantType="primary"
                    sizeType="small"
                    onClick={onComplete}
                >
                    {t("i18n_queue.complete")}
                </CustomButton>
            );
        default:
            return null;
    }
};

export default StatusButtons;
