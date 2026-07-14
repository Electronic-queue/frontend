import { useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import { ActiveRequest } from "../model/types";

interface ActiveRequestCardProps {
    data: ActiveRequest;
    isCancelling: boolean;
    cancelError: string;
    onCheckAnotherIin: () => void;
    onCancelRequest: () => Promise<void> | void;
}

interface InfoRowProps {
    label: string;
    value: string;
    emphasized?: boolean;
}

interface RequestStatusDesign {
    title: string;
    subtitle: string;
    badge: string;
    background: string;
    shadow: string;
    message: string;
    messageBackground: string;
    messageColor: string;
    showCancelButton: boolean;
}

const getStatusDesign = (
    statusId: number,
    t: TFunction
): RequestStatusDesign => {
    switch (statusId) {
        case 1:
            return {
                title: t("activeRequest.status.waiting.title"),
                subtitle: t("activeRequest.status.waiting.subtitle"),
                badge: t("activeRequest.status.waiting.badge"),
                background:
                    "linear-gradient(135deg, #3678dc 0%, #2159cc 100%)",
                shadow: "0 14px 40px rgba(37, 99, 235, 0.18)",
                message: t("activeRequest.status.waiting.message"),
                messageBackground: "#eff6ff",
                messageColor: "#1d4ed8",
                showCancelButton: true,
            };

        case 3:
            return {
                title: t("activeRequest.status.calling.title"),
                subtitle: t("activeRequest.status.calling.subtitle"),
                badge: t("activeRequest.status.calling.badge"),
                background:
                    "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                shadow: "0 14px 40px rgba(234, 88, 12, 0.2)",
                message: t("activeRequest.status.calling.message"),
                messageBackground: "#fff7ed",
                messageColor: "#c2410c",
                showCancelButton: true,
            };

        case 4:
            return {
                title: t("activeRequest.status.serving.title"),
                subtitle: t("activeRequest.status.serving.subtitle"),
                badge: t("activeRequest.status.serving.badge"),
                background:
                    "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                shadow: "0 14px 40px rgba(22, 163, 74, 0.2)",
                message: t("activeRequest.status.serving.message"),
                messageBackground: "#f0fdf4",
                messageColor: "#15803d",
                showCancelButton: false,
            };

        default:
            return {
                title: t("activeRequest.status.active.title"),
                subtitle: t("activeRequest.status.active.subtitle"),
                badge: t("activeRequest.status.active.badge"),
                background:
                    "linear-gradient(135deg, #3678dc 0%, #2159cc 100%)",
                shadow: "0 14px 40px rgba(37, 99, 235, 0.18)",
                message: t("activeRequest.status.active.message"),
                messageBackground: "#eff6ff",
                messageColor: "#1d4ed8",
                showCancelButton: false,
            };
    }
};

const getDateLocale = (language: string) => {
    if (language.startsWith("kk") || language.startsWith("kz")) {
        return "kk-KZ";
    }

    if (language.startsWith("en")) {
        return "en-US";
    }

    return "ru-RU";
};

const formatDate = (
    date: string | null | undefined,
    language: string,
    fallback: string
) => {
    if (!date) {
        return fallback;
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return fallback;
    }

    return new Intl.DateTimeFormat(getDateLocale(language), {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(parsedDate);
};

const formatExpectedTime = (
    date: string | null | undefined,
    language: string,
    fallback: string
) => {
    if (!date) {
        return fallback;
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return fallback;
    }

    return new Intl.DateTimeFormat(getDateLocale(language), {
        hour: "2-digit",
        minute: "2-digit",
    }).format(parsedDate);
};

const getManagerName = (data: ActiveRequest, fallback: string) => {
    const managerName = [data.managerLastName, data.managerFirstName]
        .filter(Boolean)
        .join(" ")
        .trim();

    return managerName || fallback;
};

const InfoRow = ({ label, value, emphasized = false }: InfoRowProps) => {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                minHeight: 54,
                px: 1.6,
                py: 1.25,
                borderRadius: "15px",
                backgroundColor: emphasized ? "#eff6ff" : "#f8fafc",
                border: emphasized
                    ? "1px solid #dbeafe"
                    : "1px solid transparent",
            }}
        >
            <Typography
                sx={{
                    flexShrink: 0,
                    fontSize: 13,
                    color: "#64748b",
                }}
            >
                {label}
            </Typography>

            <Typography
                sx={{
                    fontSize: emphasized ? 16 : 14,
                    fontWeight: emphasized ? 800 : 700,
                    color: emphasized ? "#1d4ed8" : "#111827",
                    textAlign: "right",
                    lineHeight: 1.35,
                    overflowWrap: "anywhere",
                }}
            >
                {value}
            </Typography>
        </Box>
    );
};

export const ActiveRequestCard = ({
    data,
    isCancelling,
    cancelError,
    onCheckAnotherIin,
    onCancelRequest,
}: ActiveRequestCardProps) => {
    const { t, i18n } = useTranslation();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const design = getStatusDesign(data.statusId, t);

    const handleConfirmCancel = async () => {
        await onCancelRequest();
        setIsConfirmOpen(false);
    };

    return (
        <>
            <Box
                sx={{
                    overflow: "hidden",
                    borderRadius: "24px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e6ebf2",
                    boxShadow: design.shadow,
                }}
            >
                <Box
                    sx={{
                        position: "relative",
                        overflow: "hidden",
                        p: 2.5,
                        color: "#ffffff",
                        background: design.background,
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            top: -50,
                            right: -45,
                            width: 140,
                            height: 140,
                            borderRadius: "50%",
                            backgroundColor: "rgba(255,255,255,0.09)",
                        }}
                    />

                    <Box
                        sx={{
                            position: "absolute",
                            bottom: -80,
                            left: -45,
                            width: 160,
                            height: 160,
                            borderRadius: "50%",
                            backgroundColor: "rgba(255,255,255,0.06)",
                        }}
                    />

                    <Box
                        sx={{
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                gap: 1.5,
                                mb: 2,
                            }}
                        >
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: 17,
                                        fontWeight: 800,
                                        lineHeight: 1.25,
                                    }}
                                >
                                    {design.title}
                                </Typography>

                                <Typography
                                    sx={{
                                        mt: 0.4,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        opacity: 0.85,
                                    }}
                                >
                                    {design.subtitle}
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    flexShrink: 0,
                                    px: 1.3,
                                    py: 0.7,
                                    borderRadius: "999px",
                                    backgroundColor:
                                        "rgba(255,255,255,0.18)",
                                    backdropFilter: "blur(8px)",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 11,
                                        fontWeight: 800,
                                        lineHeight: 1,
                                    }}
                                >
                                    {design.badge}
                                </Typography>
                            </Box>
                        </Box>

                        <Typography
                            sx={{
                                fontSize: 13,
                                fontWeight: 600,
                                opacity: 0.85,
                            }}
                        >
                            {t("activeRequest.ticket.label")}
                        </Typography>

                        <Typography
                            sx={{
                                mt: 0.2,
                                fontSize: 44,
                                fontWeight: 850,
                                lineHeight: 1.05,
                                letterSpacing: "-1px",
                            }}
                        >
                            №{data.ticketNumber}
                        </Typography>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 1.5,
                                mt: 2.5,
                            }}
                        >
                            <Box
                                sx={{
                                    p: 1.4,
                                    borderRadius: "15px",
                                    backgroundColor:
                                        "rgba(255,255,255,0.13)",
                                    backdropFilter: "blur(8px)",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 11,
                                        opacity: 0.8,
                                    }}
                                >
                                    {t("activeRequest.fields.window")}
                                </Typography>

                                <Typography
                                    sx={{
                                        mt: 0.3,
                                        fontSize: 27,
                                        fontWeight: 850,
                                        lineHeight: 1,
                                    }}
                                >
                                    {data.windowNumber ?? "—"}
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    p: 1.4,
                                    borderRadius: "15px",
                                    backgroundColor:
                                        "rgba(255,255,255,0.13)",
                                    backdropFilter: "blur(8px)",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 11,
                                        opacity: 0.8,
                                    }}
                                >
                                    {t(
                                        "activeRequest.fields.expectedAcceptanceTime"
                                    )}
                                </Typography>

                                <Typography
                                    sx={{
                                        mt: 0.3,
                                        fontSize: 14,
                                        fontWeight: 750,
                                        lineHeight: 1.35,
                                    }}
                                >
                                    {formatExpectedTime(
                                        data.expectedAcceptanceTime,
                                        i18n.language,
                                        t("activeRequest.values.waitForCall")
                                    )}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ p: 2.4 }}>
                    <Typography
                        sx={{
                            fontSize: 19,
                            fontWeight: 800,
                            color: "#111827",
                            lineHeight: 1.35,
                        }}
                    >
                        {data.lastName} {data.firstName} {data.surName}
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.5,
                            fontSize: 13,
                            color: "#64748b",
                        }}
                    >
                        {t("activeRequest.fields.iin")}: {data.iin}
                    </Typography>

                    <Box
                        sx={{
                            mt: 2.2,
                            p: 1.8,
                            borderRadius: "17px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #edf1f6",
                        }}
                    >
                        <Typography
                            sx={{
                                mb: 0.5,
                                fontSize: 12,
                                color: "#64748b",
                            }}
                        >
                            {t("activeRequest.fields.service")}
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: 15,
                                fontWeight: 750,
                                color: "#111827",
                                lineHeight: 1.4,
                            }}
                        >
                            {data.serviceNameRu ||
                                t("activeRequest.values.serviceNotSpecified")}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            mt: 1.2,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.1,
                        }}
                    >
                        <InfoRow
                            label={t("activeRequest.fields.window")}
                            value={
                                data.windowNumber !== null &&
                                data.windowNumber !== undefined
                                    ? String(data.windowNumber)
                                    : t(
                                          "activeRequest.values.windowNotAssigned"
                                      )
                            }
                            emphasized={
                                data.statusId === 3 &&
                                data.windowNumber !== null &&
                                data.windowNumber !== undefined
                            }
                        />

                        <InfoRow
                            label={t("activeRequest.fields.manager")}
                            value={getManagerName(
                                data,
                                t("activeRequest.values.managerNotAssigned")
                            )}
                        />

                        <InfoRow
                            label={t(
                                "activeRequest.fields.averageExecutionTime"
                            )}
                            value={
                                data.averageExecutionTime > 0
                                    ? t("activeRequest.values.minutes", {
                                          count: data.averageExecutionTime,
                                      })
                                    : t("activeRequest.values.notSpecified")
                            }
                        />

                        <InfoRow
                            label={t("activeRequest.fields.recordNumber")}
                            value={`#${data.recordId}`}
                        />

                        <InfoRow
                            label={t("activeRequest.fields.createdOn")}
                            value={formatDate(
                                data.createdOn,
                                i18n.language,
                                t("activeRequest.values.notSpecified")
                            )}
                        />
                    </Box>

                    <Box
                        sx={{
                            mt: 2,
                            p: 1.6,
                            borderRadius: "15px",
                            backgroundColor: design.messageBackground,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 13,
                                fontWeight: 650,
                                lineHeight: 1.5,
                                color: design.messageColor,
                            }}
                        >
                            {design.message}
                        </Typography>
                    </Box>

                    {cancelError && (
                        <Box
                            sx={{
                                mt: 1.5,
                                p: 1.5,
                                borderRadius: "14px",
                                backgroundColor: "#fef2f2",
                                border: "1px solid #fecaca",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: 13,
                                    fontWeight: 650,
                                    lineHeight: 1.5,
                                    color: "#b91c1c",
                                }}
                            >
                                {cancelError}
                            </Typography>
                        </Box>
                    )}

                    {design.showCancelButton && (
                        <Button
                            fullWidth
                            variant="contained"
                            disabled={isCancelling}
                            onClick={() => setIsConfirmOpen(true)}
                            sx={{
                                mt: 2,
                                minHeight: 50,
                                borderRadius: "14px",
                                textTransform: "none",
                                fontSize: 14,
                                fontWeight: 750,
                                backgroundColor: "#dc2626",
                                boxShadow:
                                    "0 8px 18px rgba(220,38,38,0.20)",

                                "&:hover": {
                                    backgroundColor: "#b91c1c",
                                },
                            }}
                        >
                            {t("activeRequest.actions.cancelQueue")}
                        </Button>
                    )}

                    <Button
                        fullWidth
                        disabled={isCancelling}
                        onClick={onCheckAnotherIin}
                        sx={{
                            mt: 1.2,
                            minHeight: 46,
                            borderRadius: "13px",
                            textTransform: "none",
                            fontWeight: 700,
                            color: "#356fbd",
                            backgroundColor: "#eff6ff",

                            "&:hover": {
                                backgroundColor: "#e2edff",
                            },
                        }}
                    >
                        {t("activeRequest.actions.checkAnotherIin")}
                    </Button>
                </Box>
            </Box>

            <Dialog
                open={isConfirmOpen}
                onClose={() => {
                    if (!isCancelling) {
                        setIsConfirmOpen(false);
                    }
                }}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    sx: {
                        m: 2,
                        borderRadius: "22px",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        pt: 3,
                        px: 2.5,
                        pb: 1,
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#111827",
                    }}
                >
                    {t("activeRequest.cancelDialog.title")}
                </DialogTitle>

                <DialogContent sx={{ px: 2.5 }}>
                    <Typography
                        sx={{
                            fontSize: 14,
                            lineHeight: 1.55,
                            color: "#64748b",
                        }}
                    >
                        {t("activeRequest.cancelDialog.description", {
                            ticketNumber: data.ticketNumber,
                        })}
                    </Typography>
                </DialogContent>

                <DialogActions
                    sx={{
                        p: 2.5,
                        pt: 2,
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 1.2,
                    }}
                >
                    <Button
                        fullWidth
                        disabled={isCancelling}
                        onClick={() => setIsConfirmOpen(false)}
                        sx={{
                            minHeight: 46,
                            borderRadius: "13px",
                            textTransform: "none",
                            fontWeight: 700,
                            color: "#475569",
                            backgroundColor: "#f1f5f9",
                        }}
                    >
                        {t("activeRequest.cancelDialog.no")}
                    </Button>

                    <Button
                        fullWidth
                        variant="contained"
                        disabled={isCancelling}
                        onClick={() => void handleConfirmCancel()}
                        sx={{
                            minHeight: 46,
                            borderRadius: "13px",
                            textTransform: "none",
                            fontWeight: 750,
                            backgroundColor: "#dc2626",

                            "&:hover": {
                                backgroundColor: "#b91c1c",
                            },
                        }}
                    >
                        {isCancelling ? (
                            <CircularProgress size={21} color="inherit" />
                        ) : (
                            t("activeRequest.cancelDialog.confirm")
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};