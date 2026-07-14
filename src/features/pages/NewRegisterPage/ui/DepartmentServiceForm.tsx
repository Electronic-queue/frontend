import {
    Box,
    Button,
    CircularProgress,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

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

interface LocalizedNames {
    nameRu?: string | null;
    nameEn?: string | null;
    nameKk?: string | null;
}

interface LocalizedDescriptions {
    descriptionRu?: string | null;
    descriptionEn?: string | null;
    descriptionKk?: string | null;
}

const getLocalizedName = (
    item: LocalizedNames,
    language: string
): string => {
    const normalizedLanguage = language.toLowerCase();

    if (
        normalizedLanguage.startsWith("kk") ||
        normalizedLanguage.startsWith("kz")
    ) {
        return (
            item.nameKk?.trim() ||
            item.nameRu?.trim() ||
            item.nameEn?.trim() ||
            ""
        );
    }

    if (normalizedLanguage.startsWith("en")) {
        return (
            item.nameEn?.trim() ||
            item.nameRu?.trim() ||
            item.nameKk?.trim() ||
            ""
        );
    }

    return (
        item.nameRu?.trim() ||
        item.nameKk?.trim() ||
        item.nameEn?.trim() ||
        ""
    );
};

const getLocalizedDescription = (
    item: LocalizedDescriptions,
    language: string
): string => {
    const normalizedLanguage = language.toLowerCase();

    if (
        normalizedLanguage.startsWith("kk") ||
        normalizedLanguage.startsWith("kz")
    ) {
        return (
            item.descriptionKk?.trim() ||
            item.descriptionRu?.trim() ||
            item.descriptionEn?.trim() ||
            ""
        );
    }

    if (normalizedLanguage.startsWith("en")) {
        return (
            item.descriptionEn?.trim() ||
            item.descriptionRu?.trim() ||
            item.descriptionKk?.trim() ||
            ""
        );
    }

    return (
        item.descriptionRu?.trim() ||
        item.descriptionKk?.trim() ||
        item.descriptionEn?.trim() ||
        ""
    );
};

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
    const { t, i18n } = useTranslation();

    const isLoading =
        isQueueTypesLoading || isServicesLoading || isCreating;

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
                {t("departmentServiceForm.step")}
            </Typography>

            <Typography
                sx={{
                    fontSize: 23,
                    fontWeight: 800,
                    color: "#111827",
                    mb: 0.7,
                     fontFamily: '"Arial", "Roboto", sans-serif',
                }}
            >
                {t("departmentServiceForm.title")}
            </Typography>

            <Typography
                sx={{
                    fontSize: 13,
                    color: "#6b7280",
                    lineHeight: 1.5,
                    mb: 2.5,
                }}
            >
                {t("departmentServiceForm.description")}
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
                    label={t("departmentServiceForm.fields.department")}
                    value={selectedQueueTypeId}
                    disabled={isQueueTypesLoading || isCreating}
                    onChange={(event) =>
                        onQueueTypeChange(event.target.value)
                    }
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
                            {t(
                                "departmentServiceForm.states.loadingDepartments"
                            )}
                        </MenuItem>
                    )}

                    {!isQueueTypesLoading &&
                        queueTypes.length === 0 && (
                            <MenuItem disabled value="">
                                {t(
                                    "departmentServiceForm.states.departmentsNotFound"
                                )}
                            </MenuItem>
                        )}

                    {queueTypes.map((queueType) => {
                        const queueTypeName = getLocalizedName(
                            queueType,
                            i18n.language
                        );

                        return (
                            <MenuItem
                                key={queueType.queueTypeId}
                                value={queueType.queueTypeId}
                                sx={{
                                    whiteSpace: "normal",
                                    py: 1.3,
                                }}
                            >
                                {queueTypeName ||
                                    t(
                                        "departmentServiceForm.values.nameNotSpecified"
                                    )}
                            </MenuItem>
                        );
                    })}
                </TextField>

                <Box sx={{ position: "relative" }}>
                    <TextField
                        select
                        required
                        fullWidth
                        label={t(
                            "departmentServiceForm.fields.service"
                        )}
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
                                {t(
                                    "departmentServiceForm.states.selectDepartmentFirst"
                                )}
                            </MenuItem>
                        )}

                        {selectedQueueTypeId &&
                            isServicesLoading && (
                                <MenuItem disabled value="">
                                    {t(
                                        "departmentServiceForm.states.loadingServices"
                                    )}
                                </MenuItem>
                            )}

                        {selectedQueueTypeId &&
                            !isServicesLoading &&
                            services.length === 0 && (
                                <MenuItem disabled value="">
                                    {t(
                                        "departmentServiceForm.states.servicesNotFound"
                                    )}
                                </MenuItem>
                            )}

                        {services.map((service) => {
                            const serviceName = getLocalizedName(
                                service,
                                i18n.language
                            );

                            const serviceDescription =
                                getLocalizedDescription(
                                    service,
                                    i18n.language
                                );

                            return (
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
                                            {serviceName ||
                                                t(
                                                    "departmentServiceForm.values.nameNotSpecified"
                                                )}
                                        </Typography>

                                        {serviceDescription && (
                                            <Typography
                                                sx={{
                                                    mt: 0.35,
                                                    fontSize: 12,
                                                    lineHeight: 1.4,
                                                    color: "#64748b",
                                                }}
                                            >
                                                {serviceDescription}
                                            </Typography>
                                        )}

                                        {service.averageExecutionTime >
                                            0 && (
                                            <Typography
                                                sx={{
                                                    mt: 0.4,
                                                    fontSize: 12,
                                                    color: "#64748b",
                                                }}
                                            >
                                                {t(
                                                    "departmentServiceForm.averageTime",
                                                    {
                                                        count: service.averageExecutionTime,
                                                    }
                                                )}
                                            </Typography>
                                        )}
                                    </Box>
                                </MenuItem>
                            );
                        })}
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
                        <CircularProgress
                            size={23}
                            color="inherit"
                        />
                    ) : (
                        t(
                            "departmentServiceForm.actions.createRequest"
                        )
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
                    {t("departmentServiceForm.actions.back")}
                </Button>
            </Box>
        </Box>
    );
};