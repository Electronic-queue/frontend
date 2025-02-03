import { List, ListItemButton, ListItemText } from "@mui/material";

export interface Service {
    id: number;
    name: string;
}

interface ServiceListProps {
    services: Service[];
    onSelect: (service: Service) => void;
    selectedService: Service | null;
}

const ServiceList: React.FC<ServiceListProps> = ({
    services,
    onSelect,
    selectedService,
}) => {
    return (
        <List sx={{ maxHeight: 300, overflowY: "auto" }}>
            {services.map((service) => {
                const isSelected = selectedService?.id === service.id;

                return (
                    <ListItemButton
                        key={service.id}
                        selected={isSelected}
                        onClick={() => onSelect(service)}
                        sx={{
                            backgroundColor: isSelected ? "#3A6CB4" : "inherit",
                            color: isSelected ? "white" : "black",
                            "&:hover": {
                                backgroundColor: "#e7edf6",
                                color: "black",
                            },
                            "&.Mui-selected": {
                                backgroundColor: "#3A6CB4 !important",
                                color: "white !important",
                                "&:hover": {
                                    backgroundColor: "#3A6CB4",
                                    color: "white",
                                },
                            },
                        }}
                    >
                        <ListItemText primary={service.name} />
                    </ListItemButton>
                );
            })}
        </List>
    );
};

export default ServiceList;
