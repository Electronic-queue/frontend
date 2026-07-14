import {
    Box,
    Button,
    CircularProgress,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";
import { QueueType, Service } from "../model/types";
import { inputStyles, primaryButtonStyles } from "./commonStyles";

interface DepartmentServiceFormProps {
    queueTypes: QueueType[];
    services: Service[];

    selectedQueueTypeId: string;
    selectedServiceId: string;

    isQueueTypesLoading: boolean;
    isServicesLoading: boolean;
    isCreating: boolean;

    error: string;

    onQueueTypeChange: (queueTypeId: string) => void;
    onServiceChange: (serviceId: string) => void;
    onSubmit: () => void;
    onBack: () => void;
}

export const DepartmentServiceForm = ({
    queueTypes,
    services,
    selectedQueueTypeId,
    selectedServiceId,
    isQueueTypesLoading,
    isServicesLoading,
    isCreating,
    error,
    onQueueTypeChange,
    onServiceChange,
    onSubmit,
    onBack,
}: DepartmentServiceFormProps) => {
    const isLoading = isQueueTypesLoading || isServicesLoading || isCreating;

    return (
        <Box>
            <Typography
                sx={{
                    fontSize: 13,
                    color: "#356fbd",
                    fontWeight: 700,
                    mb: 0.8,
                }}
            >
                Шаг 2 из 2
            </Typography>

            <Typography
                sx={{
                    fontSize: 23,
                    fontWeight: 800,
                    color: "#111827",
                    mb: 0.7,
                }}
            >
                Выберите услугу
            </Typography>

            <Typography
                sx={{
                    fontSize: 13,
                    color: "#6b7280",
                    lineHeight: 1.5,
                    mb: 2.5,
                }}
            >
                Сначала выберите подразделение, затем необходимую услугу.
            </Typography>

            <Box
                component="form"
                onSubmit={(event) => {
                    event.preventDefault();

                    if (selectedServiceId && !isLoading) {
                        onSubmit();
                    }
                }}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.7,
                }}
            >
                <TextField
                    select
                    required
                    fullWidth
                    label="Подразделение"
                    value={selectedQueueTypeId}
                    disabled={isQueueTypesLoading || isCreating}
                    onChange={(event) => onQueueTypeChange(event.target.value)}
                    sx={inputStyles}
                    SelectProps={{
                        MenuProps: {
                            PaperProps: {
                                sx: {
                                    maxHeight: 320,
                                    borderRadius: "14px",
                                },
                            },
                        },
                    }}
                >
                    {isQueueTypesLoading && (
                        <MenuItem disabled value="">
                            Загрузка подразделений...
                        </MenuItem>
                    )}

                    {!isQueueTypesLoading && queueTypes.length === 0 && (
                        <MenuItem disabled value="">
                            Подразделения не найдены
                        </MenuItem>
                    )}

                    {queueTypes.map((queueType) => (
                        <MenuItem
                            key={queueType.queueTypeId}
                            value={queueType.queueTypeId}
                            sx={{
                                whiteSpace: "normal",
                                py: 1.3,
                            }}
                        >
                            {queueType.nameRu.trim()}
                        </MenuItem>
                    ))}
                </TextField>

                <Box sx={{ position: "relative" }}>
                    <TextField
                        select
                        required
                        fullWidth
                        label="Услуга"
                        value={selectedServiceId}
                        disabled={
                            !selectedQueueTypeId ||
                            isServicesLoading ||
                            isCreating
                        }
                        onChange={(event) =>
                            onServiceChange(event.target.value)
                        }
                        sx={inputStyles}
                        SelectProps={{
                            MenuProps: {
                                PaperProps: {
                                    sx: {
                                        maxHeight: 350,
                                        borderRadius: "14px",
                                    },
                                },
                            },
                        }}
                    >
                        {!selectedQueueTypeId && (
                            <MenuItem disabled value="">
                                Сначала выберите подразделение
                            </MenuItem>
                        )}

                        {selectedQueueTypeId && isServicesLoading && (
                            <MenuItem disabled value="">
                                Загрузка услуг...
                            </MenuItem>
                        )}

                        {selectedQueueTypeId &&
                            !isServicesLoading &&
                            services.length === 0 && (
                                <MenuItem disabled value="">
                                    Услуги не найдены
                                </MenuItem>
                            )}

                        {services.map((service) => (
                            <MenuItem
                                key={service.serviceId}
                                value={service.serviceId}
                                sx={{
                                    alignItems: "flex-start",
                                    whiteSpace: "normal",
                                    py: 1.3,
                                }}
                            >
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: 14,
                                            fontWeight: 600,
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {service.nameRu}
                                    </Typography>

                                    {service.averageExecutionTime > 0 && (
                                        <Typography
                                            sx={{
                                                mt: 0.3,
                                                fontSize: 12,
                                                color: "#64748b",
                                            }}
                                        >
                                            Среднее время:{" "}
                                            {service.averageExecutionTime} мин.
                                        </Typography>
                                    )}
                                </Box>
                            </MenuItem>
                        ))}
                    </TextField>

                    {isServicesLoading && (
                        <CircularProgress
                            size={20}
                            sx={{
                                position: "absolute",
                                right: 44,
                                top: 18,
                                pointerEvents: "none",
                            }}
                        />
                    )}
                </Box>

                {error && (
                    <Box
                        sx={{
                            p: 1.7,
                            borderRadius: "14px",
                            backgroundColor: "#fef2f2",
                            border: "1px solid #fecaca",
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 13,
                                color: "#b91c1c",
                                fontWeight: 600,
                                lineHeight: 1.5,
                            }}
                        >
                            {error}
                        </Typography>
                    </Box>
                )}

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={!selectedServiceId || isLoading}
                    sx={{
                        ...primaryButtonStyles,
                        mt: 0.5,
                    }}
                >
                    {isCreating ? (
                        <CircularProgress size={23} color="inherit" />
                    ) : (
                        "Создать заявку"
                    )}
                </Button>

                <Button
                    fullWidth
                    disabled={isCreating}
                    onClick={onBack}
                    sx={{
                        minHeight: 44,
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: 700,
                        color: "#64748b",
                    }}
                >
                    Назад
                </Button>
            </Box>
        </Box>
    );
};
