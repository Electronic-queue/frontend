import { FC, useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs, { Dayjs } from "dayjs";
import { Box } from "@mui/material";
import { SelectTimeProps } from "../types/selectTimeTypes";
import theme from "src/styles/theme";

const SelectTime: FC<SelectTimeProps> = ({ onTimeSelect }) => {
    const [selectedTime, setSelectedTime] = useState<Dayjs | null>(
        dayjs().minute(1).second(0)
    );

    const handleTimeChange = (newValue: Dayjs | null) => {
        if (newValue) {
            let minutes = newValue.minute();
            if (minutes > 30) {
                minutes = 30;
            }
            const adjustedTime = dayjs().minute(minutes).second(0);
            setSelectedTime(adjustedTime);
            onTimeSelect(minutes);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
                sx={{ minWidth: 200, "& .MuiClock-root": { display: "none" } }}
            >
                <TimePicker
                    label="Выберите время (минуты)"
                    value={selectedTime}
                    onChange={handleTimeChange}
                    views={["minutes"]}
                    format="mm"
                    ampm={false}
                />
            </Box>
        </LocalizationProvider>
    );
};

export default SelectTime;
