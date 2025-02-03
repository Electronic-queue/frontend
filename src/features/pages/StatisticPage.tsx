import { FC, useState } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Sidebar from "src/widgets/sideBar/ui/SideBar";
import FilterComponent from "src/widgets/filterComponent/ui/FilterComponent";

const HeadText = styled(Typography)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontSize: theme.typography.h1.fontSize,
}));

const items = [
    "Общее количество талонов",
    "Количество не явившихся клиентов",
    "Среднее время принятия клиента",
    "Среднее время ожидания клиента",
    "Количество Q-г талонов и талонов созданных менеджером",
    "Пиковые часы",
    "Статистика ISA",
];

const StatisticPage: FC = () => {
    const [reportName, setReportName] = useState(items[0]);

    return (
        <>
            <HeadText>Статистика: {reportName}</HeadText>
            <Box sx={{ display: "flex", gap: 6 }}>
                <Sidebar
                    title="Формирование отчетов"
                    items={items}
                    onSelect={(item) => setReportName(item)}
                />
                <FilterComponent />
            </Box>
        </>
    );
};

export default StatisticPage;
