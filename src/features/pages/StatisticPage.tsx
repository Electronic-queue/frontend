import React, { FC, useState } from "react";
import { styled, Typography } from "@mui/material";
import Sidebar from "src/widgets/sideBar/ui/SideBar";

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
            <Sidebar
                title="Формирование отчетов"
                items={items}
                onSelect={(item) => setReportName(item)}
            />
        </>
    );
};

export default StatisticPage;
