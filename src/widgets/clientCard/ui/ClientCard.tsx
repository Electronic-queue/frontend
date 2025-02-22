import { FC, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useTranslation } from "react-i18next";
import CustomButton from "../../../components/Button";
import ReusableModal from "../../../components/ModalPage";
import CustomSearchInput from "../../../components/SearchInput";
import SearchIcon from "@mui/icons-material/Search";
import ReusableTable from "src/components/Table";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import data from "src/components/mock/servicesData.json";
import {
    CardContainer,
    ClientDetails,
    ActionPanel,
    TimeWrapper,
    ClientInfoWrapper,
} from "../styles/clientCardStyles";
import { ClientCardProps, ServiceData } from "../types/clientCardTypes";
import theme from "src/styles/theme";

const LabelText = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    color: theme.palette.text.primary,
    fontSize: theme.typography.body1.fontSize,
    textAlign: "left",
}));

const ValueText = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body1.fontSize,
    textAlign: "left",
}));

const handleSend = (row: any) => {};

const ClientCard: FC<ClientCardProps> = ({
    clientData,
    serviceTime,
    onAccept,
    onComplete,
    callNext,
    status,
}) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const handleModalOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    const handleSnackbarClose = () => setSnackbarOpen(false);
    const [searchValue, setSearchValue] = useState("");
    const [filteredData, setFilteredData] = useState<ServiceData[]>(data);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);

        const filtered = data.filter((row) =>
            row.service.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredData(filtered);
    };
    const handleRowClick = (row: any) => {
        setAlertMessage(
            `Вы перенаправили пользователя в услугу: ${row.service}`
        );

        setSnackbarOpen(true);

        handleClose();
    };
    const columns = [
        {
            accessorKey: "id",
            header: "№",
        },
        {
            accessorKey: "service",
            header: `${t("i18n_queue.serviceName")}`,
        },
        {
            accessorKey: "details",
            header: `${t("i18n_queue.details")}`,
            cell: ({ row }: { row: any }) => (
                <CustomButton
                    variantType="primary"
                    sizeType="small"
                    onClick={() => handleSend(row.original)}
                >
                    {t("i18n_queue.submit")}
                </CustomButton>
            ),
        },
    ];

    return (
        <CardContainer>
            <ClientDetails>
                {[
                    {
                        label: t("i18n_queue.clientNumber"),
                        value: clientData.clientNumber,
                    },
                    {
                        label: t("i18n_queue.lastName"),
                        value: clientData.lastName,
                    },
                    {
                        label: t("i18n_queue.firstName"),
                        value: clientData.firstName,
                    },
                    {
                        label: t("i18n_queue.surname"),
                        value: clientData.patronymic,
                    },
                    {
                        label: t("i18n_queue.service"),
                        value: clientData.service,
                    },
                    { label: t("i18n_queue.iin"), value: clientData.iin },
                ].map(({ label, value }, index) => (
                    <ClientInfoWrapper key={index}>
                        <LabelText>{label}</LabelText>
                        <ValueText>{value}</ValueText>
                    </ClientInfoWrapper>
                ))}
            </ClientDetails>

            <ActionPanel>
                <TimeWrapper>
                    <AccessTimeIcon color="inherit" />
                    <Box display="flex" gap={1}>
                        <Typography variant="h6" color="text" fontWeight="bold">
                            {t("i18n_queue.serviceTime")}:
                        </Typography>
                        <Typography variant="h6" color="text">
                            {serviceTime} {t("i18n_queue.minut")}
                        </Typography>
                    </Box>
                </TimeWrapper>

                <Box display="flex" gap={2}>
                    {status === "idle" && (
                        <CustomButton
                            variantType="primary"
                            sizeType="small"
                            onClick={callNext}
                        >
                            {t("i18n_queue.callNext")}
                        </CustomButton>
                    )}

                    {status === "called" && (
                        <>
                            <CustomButton
                                variantType="primary"
                                sizeType="small"
                                onClick={handleModalOpen}
                            >
                                {t("i18n_queue.redirect")}
                            </CustomButton>
                            <ReusableModal
                                open={isOpen}
                                onClose={handleClose}
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
                                        placeholder={t(
                                            "i18n_queue.searchServicePlaceholder"
                                        )}
                                        icon={
                                            <SearchIcon
                                                style={{ color: "#667085" }}
                                            />
                                        }
                                        value={searchValue}
                                        onChange={handleInputChange}
                                        width={theme.spacing(87)}
                                        height={theme.spacing(6)}
                                        borderColor={
                                            theme.palette.lightBlueGray.main
                                        }
                                        borderRadius={theme.shape.borderRadius}
                                        backgroundColor={
                                            theme.palette.lightGray.main
                                        }
                                        iconPosition="left"
                                    />

                                    <ReusableTable
                                        data={filteredData}
                                        columns={columns}
                                        pageSize={5}
                                        onRowClick={handleRowClick}
                                    />
                                </Box>
                            </ReusableModal>
                            <CustomButton
                                variantType="primary"
                                sizeType="small"
                                onClick={onAccept}
                            >
                                {t("i18n_queue.accept")}
                            </CustomButton>
                        </>
                    )}

                    {status === "accepted" && (
                        <CustomButton
                            variantType="primary"
                            sizeType="small"
                            onClick={onComplete}
                        >
                            {t("i18n_queue.complete")}
                        </CustomButton>
                    )}
                </Box>
            </ActionPanel>
        </CardContainer>
    );
};

export default ClientCard;
