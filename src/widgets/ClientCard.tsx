import { FC, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useTranslation } from "react-i18next";
import CustomButton from "../components/Button";
import ReusableModal from "../components/ModalPage";
import CustomSearchInput from "../components/SearchInput";
import SearchIcon from "@mui/icons-material/Search";
import ReusableTable from "src/components/Table";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
interface ClientCardProps {
    clientData: {
        clientNumber: string;
        lastName: string;
        firstName: string;
        patronymic?: string;
        service: string;
        iin: string;
    };
    serviceTime: string;
    onRedirect: () => void;
    onAccept: () => void;
}

const CardContainer = styled(Box)(({ theme }) => ({
    width: theme.spacing(140.5),
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: "2px 4px 10px rgba(0, 0, 0, 0.25)",
}));

const ClientDetails = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
}));

const ActionPanel = styled(Box)(({}) => ({
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-end",
}));

const TimeWrapper = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
}));

const ClientInfoWrapper = styled(Box)(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing(5),
    width: "100%",
}));

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

const columns = [
    {
        accessorKey: "id",
        header: "№",
    },
    {
        accessorKey: "service",
        header: "Название услуги",
    },
    {
        accessorKey: "details",
        header: "Детали",
        cell: ({ row }: { row: any }) => (
            <CustomButton
                variantType="primary"
                sizeType="small"
                onClick={() => handleSend(row.original)}
            >
                Отправить
            </CustomButton>
        ),
    },
];

const handleSend = (row: any) => {
    console.log("Отправлено для услуги:", row.service);
};

const data = [
    { id: 1, service: "Выдача академической справки" },
    { id: 2, service: "Выдача диплома и приложения к диплому" },
    { id: 3, service: "Перевод студента на другой факультет" },
    { id: 4, service: "Выдача справки об обучении" },
    { id: 5, service: "Аннулирование регистрации на курс" },
    { id: 6, service: "Оформление восстановления студента" },
    { id: 7, service: "Обработка заявлений на пересдачу экзаменов" },
    { id: 8, service: "Выдача справки об успеваемости" },
    { id: 9, service: "Изменение личных данных студента" },
    {
        id: 10,
        service: "Регистрация заявлений на участие в международных программах",
    },
];

const ClientCard: FC<ClientCardProps> = ({
    clientData,
    serviceTime,

    onAccept,
}) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    const handleSnackbarClose = () => setSnackbarOpen(false);
    const [searchValue, setSearchValue] = useState("");
    const [filteredData, setFilteredData] = useState(data);
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

    return (
        <CardContainer>
            <ClientDetails>
                {[
                    {
                        label: t("queue.clientNumber"),
                        value: clientData.clientNumber,
                    },
                    { label: t("queue.lastName"), value: clientData.lastName },
                    {
                        label: t("queue.firstName"),
                        value: clientData.firstName,
                    },
                    { label: t("queue.surname"), value: clientData.patronymic },
                    { label: t("queue.service"), value: clientData.service },
                    { label: t("queue.iin"), value: clientData.iin },
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
                            {t("queue.serviceTime")}:
                        </Typography>
                        <Typography variant="h6" color="text">
                            {serviceTime}
                        </Typography>
                    </Box>
                </TimeWrapper>

                <Box display="flex" gap={2}>
                    <CustomButton
                        variantType="primary"
                        sizeType="small"
                        onClick={handleOpen}
                    >
                        {t("queue.redirect")}
                    </CustomButton>
                    <ReusableModal
                        open={isOpen}
                        onClose={handleClose}
                        title="Перенаправление услуги"
                        width="796px"
                        showCloseButton={false}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                            }}
                        >
                            <CustomSearchInput
                                placeholder="Поиск услуги..."
                                icon={
                                    <SearchIcon style={{ color: "#667085" }} />
                                }
                                value={searchValue}
                                onChange={handleInputChange}
                                width="684px"
                                height="44px"
                                borderColor="#d0d4df"
                                borderRadius="8px"
                                backgroundColor="#f0f0f0"
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
                        {t("queue.accept")}
                    </CustomButton>
                </Box>
            </ActionPanel>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
            >
                <Alert onClose={handleSnackbarClose} severity="success">
                    {alertMessage}
                </Alert>
            </Snackbar>
        </CardContainer>
    );
};

export default ClientCard;
