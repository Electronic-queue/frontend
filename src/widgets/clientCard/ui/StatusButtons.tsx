import { FC, useState } from "react";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import CustomButton from "../../../components/Button";
import ReusableModal from "../../../components/ModalPage";
import CustomSearchInput from "../../../components/SearchInput";
import SearchIcon from "@mui/icons-material/Search";
import ReusableTable from "src/components/Table";
import theme from "src/styles/theme";
import data from "src/components/mock/servicesData.json";
import { ServiceData } from "../types/clientCardTypes";

interface StatusButtonsProps {
    status: string;
    callNext: () => void;
    onAccept: () => void;
    onComplete: () => void;
    loading: boolean;
}

const IdleButton: FC<{ callNext: () => void; loading: boolean }> = ({
    callNext,
    loading,
}) => {
    const { t } = useTranslation();
    return (
        <CustomButton
            variantType="primary"
            sizeType="small"
            onClick={callNext}
            disabled={loading}
        >
            {t("i18n_queue.callNext")}
        </CustomButton>
    );
};

const CalledButtons: FC<{ onAccept: () => void }> = ({ onAccept }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [filteredData, setFilteredData] = useState<ServiceData[]>(data);

    const handleModalOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        setFilteredData(
            data.filter((row) =>
                row.service.toLowerCase().includes(value.toLowerCase())
            )
        );
    };

    return (
        <Box sx={{ display: "flex", gap: theme.spacing(2) }}>
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
                width="{theme.spacing(99)}"
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
                        onChange={handleInputChange}
                        width={theme.spacing(87)}
                        height={theme.spacing(6)}
                        borderColor={theme.palette.lightBlueGray.main}
                        borderRadius={theme.shape.borderRadius}
                        backgroundColor={theme.palette.lightGray.main}
                        iconPosition="left"
                    />
                    <ReusableTable
                        data={filteredData}
                        columns={[
                            { accessorKey: "id", header: "№" },
                            {
                                accessorKey: "service",
                                header: t("i18n_queue.serviceName"),
                            },
                        ]}
                        pageSize={5}
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
        </Box>
    );
};

const AcceptedButton: FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const { t } = useTranslation();
    return (
        <CustomButton
            variantType="primary"
            sizeType="small"
            onClick={onComplete}
        >
            {t("i18n_queue.complete")}
        </CustomButton>
    );
};

const StatusButtons: FC<StatusButtonsProps> = ({
    status,
    callNext,
    onAccept,
    onComplete,
    loading,
}) => {
    switch (status) {
        case "idle":
            return <IdleButton callNext={callNext} loading={loading} />;
        case "called":
            return <CalledButtons onAccept={onAccept} />;
        case "accepted":
            return <AcceptedButton onComplete={onComplete} />;
        default:
            return null;
    }
};

export default StatusButtons;
