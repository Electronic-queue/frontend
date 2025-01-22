import { FC, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import SearchIcon from "@mui/icons-material/Search";
import {
    Box,
    styled,
    TextField,
    Typography,
    Select,
    MenuItem,
    SelectChangeEvent,
} from "@mui/material";
import { Dayjs } from "dayjs";
import CustomSearchInput from "src/components/SearchInput";
import theme from "src/styles/theme";
import CustomButton from "src/components/Button";

const Container = styled(Box)(({ theme }) => ({
    width: theme.spacing(99),
    height: theme.spacing(34),
    backgroundColor: theme.palette.lightBlue.main,
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(3),
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    border: `1px solid ${theme.palette.divider}`,
    gap: theme.shape.borderRadius,
}));

const Row = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(3),
}));

const Label = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h6.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
    marginRight: theme.spacing(1),
    whiteSpace: "nowrap",
}));

const FilterComponent: FC = () => {
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    const [filter, setFilter] = useState("");

    const handleFilterChange = (event: SelectChangeEvent<string>) => {
        setFilter(event.target.value);
    };
    const handleStartDateChange = (newValue: Dayjs | null) => {
        if (newValue && endDate && newValue.isAfter(endDate)) {
            alert("Начальная дата не может быть позже конечной даты.");
            return;
        }
        setStartDate(newValue);
    };

    const handleEndDateChange = (newValue: Dayjs | null) => {
        if (newValue && startDate && newValue.isBefore(startDate)) {
            alert("Конечная дата не может быть раньше начальной даты.");
            return;
        }
        setEndDate(newValue);
    };

    return (
        <Container>
            <Row>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: theme.spacing(1),
                        justifyContent: "center",
                    }}
                >
                    <Label>
                        Временной <br /> промежуток
                    </Label>
                    <DatePicker
                        sx={{
                            width: theme.spacing(17.5),
                            backgroundColor: "white",
                        }}
                        value={startDate}
                        onChange={handleStartDateChange}
                        slots={{ textField: TextField }}
                    />
                    <Typography>по</Typography>
                    <DatePicker
                        sx={{
                            width: theme.spacing(17.5),
                            backgroundColor: "white",
                        }}
                        value={endDate}
                        onChange={handleEndDateChange}
                        slots={{ textField: TextField }}
                    />
                </Box>
            </Row>
            <Row>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: theme.spacing(5.8),
                        justifyContent: "center",
                    }}
                >
                    <Label>Фильтр</Label>
                    <Select
                        value={filter}
                        onChange={handleFilterChange}
                        displayEmpty
                        fullWidth
                        sx={{
                            backgroundColor: theme.palette.background.paper,
                            width: "197px",
                            height: "40px",
                        }}
                        renderValue={(selected) =>
                            selected ? selected : "Выбрать вариант"
                        }
                    >
                        <MenuItem value="">Выбрать вариант</MenuItem>
                        <MenuItem value="option1">Вариант 1</MenuItem>
                        <MenuItem value="option2">Вариант 2</MenuItem>
                    </Select>
                </Box>
            </Row>
            <Row>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: theme.spacing(5.8),
                        justifyContent: "center",
                    }}
                >
                    <Label>
                        Поиск <br /> по ИИН
                    </Label>
                    <CustomSearchInput
                        placeholder="Поиск услуги..."
                        icon={<SearchIcon style={{ color: "#667085" }} />}
                        // value={searchValue}
                        // onChange={handleInputChange}
                        width="197px"
                        height="40px"
                        borderColor={theme.palette.lightBlueGray.main}
                        borderRadius={theme.shape.borderRadius}
                        backgroundColor={theme.palette.background.paper}
                        iconPosition="left"
                    />
                </Box>
            </Row>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                }}
            >
                <CustomButton variantType="primary" sizeType="medium">
                    Построить отчет
                </CustomButton>
            </Box>
        </Container>
    );
};

const App: FC = () => (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <FilterComponent />
    </LocalizationProvider>
);

export default App;
