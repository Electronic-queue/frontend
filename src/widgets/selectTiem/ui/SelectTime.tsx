import { FC, useState } from "react";
import {
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormHelperText,
    Box,
    SelectChangeEvent,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { SelectTimeProps } from "../types/selectTimeTypes"; // Интерфейс пропсов, который можно создать отдельно

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    minWidth: 120,
    marginBottom: theme.spacing(2),
}));

const SelectTime: FC<SelectTimeProps> = ({ onTimeSelect }) => {
    const [selectedTime, setSelectedTime] = useState<number>(1);

    const handleTimeChange = (event: SelectChangeEvent<number>) => {
        const newTime = event.target.value as number;
        setSelectedTime(newTime);
        onTimeSelect(newTime);
    };

    return (
        <Box>
            <StyledFormControl>
                <InputLabel id="select-time-label">Выберите время</InputLabel>
                <Select
                    labelId="select-time-label"
                    value={selectedTime}
                    onChange={handleTimeChange}
                    label="Выберите время"
                >
                    {Array.from({ length: 30 }, (_, index) => index + 1).map(
                        (minute) => (
                            <MenuItem key={minute} value={minute}>
                                {minute} минут
                            </MenuItem>
                        )
                    )}
                </Select>
                <FormHelperText>
                    Минимум 1 минута, максимум 30 минут
                </FormHelperText>
            </StyledFormControl>
        </Box>
    );
};

export default SelectTime;
