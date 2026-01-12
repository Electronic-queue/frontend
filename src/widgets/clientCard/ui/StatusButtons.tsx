import { FC, useState, useEffect } from "react";
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
    useUpdateClientServiceMutation,
} from "src/store/managerApi";
import { CircularProgress } from "@mui/material";
import i18n from "src/i18n";

// --- Интерфейсы ---

interface StatusButtonsProps {
    status: string;
    callNext: () => void;
    onAccept: () => void;
    onComplete: () => void;
    onRedirect: (serviceIdRedirect: string) => void;
    isLoading: boolean;
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

const ButtonContent = styled(Box)({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
});

const currentLanguage = i18n.language || "ru";

// --- Вспомогательные компоненты кнопок ---

const IdleButton: FC<{ callNext: () => void; isLoading: boolean }> = ({
    callNext,
    isLoading,
}) => {
    const { t } = useTranslation();
    return (
        <CustomButton
            variantType="primary"
            sizeType="small"
            onClick={callNext}
            disabled={isLoading}
        >
            <ButtonContent>
                {isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                ) : (
                    t("i18n_queue.callNext")
                )}
            </ButtonContent>
        </CustomButton>
    );
};

const CalledButtons: FC<{ onAccept: () => void; isLoading: boolean }> = ({
    onAccept,
    isLoading,
}) => {
    const { t } = useTranslation();
    return (
        <CustomButton
            variantType="primary"
            sizeType="small"
            onClick={onAccept}
            disabled={isLoading}
        >
            <ButtonContent>
                {isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                ) : (
                    t("i18n_queue.accept")
                )}
            </ButtonContent>
        </CustomButton>
    );
};

// Компонент кнопок для статуса "Принят" (Accepted)
const AcceptedButtons: FC<{
    onComplete: () => void;
    onOpenRedirect: () => void;
    isLoading: boolean;
}> = ({ onComplete, onOpenRedirect, isLoading }) => {
    const { t } = useTranslation();
    const [redirectClient, { isLoading: isRedirecting }] =
        useRedirectClientMutation();

    const handleInitialRedirectClick = async () => {
        try {
            await redirectClient().unwrap();
            onOpenRedirect();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Box sx={{ display: "flex", gap: theme.spacing(2) }}>
            <CustomButton
                variantType="primary"
                sizeType="small"
                onClick={handleInitialRedirectClick}
                disabled={isRedirecting}
            >
                <ButtonContent>
                    {isRedirecting ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : (
                        t("i18n_queue.redirect")
                    )}
                </ButtonContent>
            </CustomButton>

            <CustomButton
                variantType="primary"
                sizeType="small"
                onClick={onComplete}
                disabled={isLoading}
            >
                <ButtonContent>
                    {isLoading ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : (
                        t("i18n_queue.complete")
                    )}
                </ButtonContent>
            </CustomButton>
        </Box>
    );
};

const RedirectModal: FC<{
    open: boolean;
    onClose: () => void;
    onSuccess: (id: string) => void;
}> = ({ open, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [searchValue, setSearchValue] = useState("");
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
        null
    );

    const [getServicesForManager, { data, isLoading: isServicesLoading }] =
        useGetServicesForManagerMutation();
    const [updateClientService, { isLoading: isUpdating }] =
        useUpdateClientServiceMutation();

    const handleFinalServiceSubmit = async () => {
        if (!selectedServiceId) return;
        try {
            await updateClientService({
                serviceId: selectedServiceId,
            }).unwrap();
            onSuccess(selectedServiceId);
            onClose();
        } catch (err) {
            console.error("Ошибка при обновлении услуги:", err);
        }
    };

    const services = Array.isArray(data)
        ? data.map((s: any, idx: number) => ({
              id: s.serviceId,
              displayId: idx + 1,
              name:
                  currentLanguage === "kz"
                      ? s.nameKk
                      : currentLanguage === "en"
                        ? s.nameEn
                        : s.nameRu,
          }))
        : [];

    const filtered = services.filter((s) =>
        s.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    useEffect(() => {
        if (open) {
            getServicesForManager();
            setSearchValue("");
            setSelectedServiceId(null);
        }
    }, [open, getServicesForManager]);

    return (
        <ReusableModal
            open={open}
            onClose={() => {}}
            showCloseButton={false}
            title={t("i18n_queue.redirectService")}
            width={theme.spacing(99)}
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <CustomSearchInput
                    placeholder={t("i18n_queue.searchServicePlaceholder")}
                    icon={<SearchIcon />}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    width="100%"
                />

                {isServicesLoading ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <MainWrapper>
                        <ReusableTable
                            data={filtered}
                            columns={[
                                { accessorKey: "displayId", header: "№" },
                                {
                                    accessorKey: "name",
                                    header: t("i18n_queue.serviceName"),
                                },
                            ]}
                            pageSize={5}
                            onRowClick={(row) => setSelectedServiceId(row.id)}
                            // ДОБАВЛЕНО: Передаем ID выбранной строки для подсветки
                            selectedId={selectedServiceId}
                        />
                        <ButtonWrapperStyles>
                            <CustomButton
                                onClick={handleFinalServiceSubmit}
                                disabled={!selectedServiceId || isUpdating}
                            >
                                <ButtonContent>
                                    {isUpdating ? (
                                        <CircularProgress
                                            size={20}
                                            color="inherit"
                                        />
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
    );
};

// --- Основной компонент экспорта ---

const StatusButtons: FC<StatusButtonsProps> = (props) => {
    const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);

    return (
        <>
            <Box sx={{ display: "flex", gap: theme.spacing(2) }}>
                {(() => {
                    switch (props.status) {
                        case "idle":
                            return (
                                <IdleButton
                                    callNext={props.callNext}
                                    isLoading={props.isLoading}
                                />
                            );
                        case "called":
                            return (
                                <CalledButtons
                                    onAccept={props.onAccept}
                                    isLoading={props.isLoading}
                                />
                            );
                        case "accepted":
                            return (
                                <AcceptedButtons
                                    onComplete={props.onComplete}
                                    onOpenRedirect={() =>
                                        setIsRedirectModalOpen(true)
                                    }
                                    isLoading={props.isLoading}
                                />
                            );
                        default:
                            return null;
                    }
                })()}
            </Box>

            <RedirectModal
                open={isRedirectModalOpen}
                onClose={() => setIsRedirectModalOpen(false)}
                onSuccess={props.onRedirect}
            />
        </>
    );
};

export default StatusButtons;
