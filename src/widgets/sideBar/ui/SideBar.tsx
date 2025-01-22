import React from "react";
import { Box, Typography, List, ListItemButton, styled } from "@mui/material";
import { SidebarProps } from "../types/SideBarTypes";

const SidebarContainer = styled(Box)(({ theme }) => ({
    width: theme.spacing(34),
    height: theme.spacing(86),
    backgroundColor: theme.palette.lightBlue.main,
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(2),
    boxSizing: "border-box",
    boxShadow: theme.shadows[2],
    border: `1px solid ${theme.palette.divider}`,
}));

const SidebarTitle = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    fontSize: theme.typography.h5.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.primary.main,
}));

const SidebarList = styled(List)(({}) => ({
    padding: 0,
    margin: 0,
}));

const SidebarListItem = styled(ListItemButton)(({ theme }) => ({
    marginBottom: theme.spacing(1),
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    "&.Mui-selected": {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.primary.main,
    },
}));

const Sidebar: React.FC<SidebarProps> = ({ title, items, onSelect }) => {
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const handleListItemClick = (index: number) => {
        setSelectedIndex(index);
        onSelect(items[index]);
    };

    return (
        <SidebarContainer>
            <SidebarTitle>{title}</SidebarTitle>
            <SidebarList>
                {items.map((item, index) => (
                    <SidebarListItem
                        key={index}
                        selected={selectedIndex === index}
                        onClick={() => handleListItemClick(index)}
                    >
                        {item}
                    </SidebarListItem>
                ))}
            </SidebarList>
        </SidebarContainer>
    );
};

export default Sidebar;
