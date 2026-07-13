import { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import { useTranslation } from "react-i18next";
import StatusButtons from "./StatusButtons";
import { ClientCardProps } from "../types/clientCardTypes";

const ClientCard: FC<ClientCardProps> = ({
    clientData,
    serviceTime,
    onAccept,
    onComplete,
    callNext,
    onRedirect,
    status,
    isLoading,
}) => {
    const { t } = useTranslation();

    const formatCreatedOn = (createdOn?: string) => {
        if (!createdOn) return "-";

        const date = new Date(createdOn);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const fullName = [
        clientData.lastName,
        clientData.firstName,
        clientData.patronymic,
    ]
        .filter((value) => value && value !== "-")
        .join(" ");

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: 1128,
                borderRadius: "18px",
                border: "1px solid #E5E7EB",
                backgroundColor: "#FFFFFF",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: {
                        xs: "flex-start",
                        md: "center",
                    },
                    flexDirection: {
                        xs: "column",
                        md: "row",
                    },
                    gap: 2,
                    px: 3,
                    py: 2.5,
                    backgroundColor: "#F8FAFC",
                    borderBottom: "1px solid #E5E7EB",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                    }}
                >
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "14px",
                            backgroundColor: "#EAF2FF",
                            color: "#2F65B8",
                            flexShrink: 0,
                        }}
                    >
                        <PersonOutlineOutlinedIcon />
                    </Box>

                    <Box>
                        <Typography
                            sx={{
                                fontSize: 12,
                                color: "#64748B",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                            }}
                        >
                            {t("i18n_queue.clientNumber")}
                        </Typography>

                        <Typography
                            sx={{
                                mt: 0.25,
                                fontSize: 25,
                                color: "#0F172A",
                                fontWeight: 800,
                                lineHeight: 1.1,
                            }}
                        >
                            № {clientData.clientNumber}
                        </Typography>
                    </Box>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1.5,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            px: 1.5,
                            py: 1,
                            borderRadius: "12px",
                            border: "1px solid #E2E8F0",
                            backgroundColor: "#FFFFFF",
                        }}
                    >
                        <CalendarMonthOutlinedIcon
                            sx={{
                                fontSize: 20,
                                color: "#2F65B8",
                            }}
                        />

                        <Box>
                            <Typography
                                sx={{
                                    fontSize: 11,
                                    color: "#64748B",
                                    fontWeight: 700,
                                }}
                            >
                                Дата создания
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: 13,
                                    color: "#0F172A",
                                    fontWeight: 700,
                                }}
                            >
                                {formatCreatedOn(clientData.createdOn)}
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            px: 1.5,
                            py: 1,
                            borderRadius: "12px",
                            border: "1px solid #E2E8F0",
                            backgroundColor: "#FFFFFF",
                        }}
                    >
                        <AccessTimeIcon
                            sx={{
                                fontSize: 20,
                                color: "#2F65B8",
                            }}
                        />

                        <Box>
                            <Typography
                                sx={{
                                    fontSize: 11,
                                    color: "#64748B",
                                    fontWeight: 700,
                                }}
                            >
                                {t("i18n_queue.serviceTime")}
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: 13,
                                    color: "#0F172A",
                                    fontWeight: 700,
                                }}
                            >
                                {serviceTime} {t("i18n_queue.minut")}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        lg: "minmax(0, 1fr) 320px",
                    },
                    gap: 3,
                    p: 3,
                }}
            >
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "1fr 1fr",
                        },
                        gap: 2,
                    }}
                >
                    <Box
                        sx={{
                            gridColumn: {
                                xs: "auto",
                                sm: "1 / -1",
                            },
                            p: 2,
                            borderRadius: "14px",
                            border: "1px solid #EDF1F5",
                            backgroundColor: "#F8FAFC",
                        }}
                    >
                        <Typography
                            sx={{
                                mb: 0.6,
                                fontSize: 11,
                                color: "#64748B",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                            }}
                        >
                            ФИО клиента
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: 18,
                                color: "#0F172A",
                                fontWeight: 750,
                            }}
                        >
                            {fullName || "-"}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            p: 2,
                            borderRadius: "14px",
                            border: "1px solid #EDF1F5",
                            backgroundColor: "#F8FAFC",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.8,
                                mb: 0.6,
                            }}
                        >
                            <BadgeOutlinedIcon
                                sx={{
                                    fontSize: 18,
                                    color: "#64748B",
                                }}
                            />

                            <Typography
                                sx={{
                                    fontSize: 11,
                                    color: "#64748B",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                {t("i18n_queue.iin")}
                            </Typography>
                        </Box>

                        <Typography
                            sx={{
                                fontSize: 15,
                                color: "#0F172A",
                                fontWeight: 700,
                                letterSpacing: "0.03em",
                            }}
                        >
                            {clientData.iin || "-"}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            p: 2,
                            borderRadius: "14px",
                            border: "1px solid #EDF1F5",
                            backgroundColor: "#F8FAFC",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.8,
                                mb: 0.6,
                            }}
                        >
                            <WorkOutlineOutlinedIcon
                                sx={{
                                    fontSize: 18,
                                    color: "#64748B",
                                }}
                            />

                            <Typography
                                sx={{
                                    fontSize: 11,
                                    color: "#64748B",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                {t("i18n_queue.service")}
                            </Typography>
                        </Box>

                        <Typography
                            sx={{
                                fontSize: 15,
                                color: "#0F172A",
                                fontWeight: 650,
                                lineHeight: 1.45,
                            }}
                        >
                            {clientData.service || "-"}
                        </Typography>
                    </Box>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        p: 2.5,
                        borderRadius: "16px",
                        border: "1px solid #EDF1F5",
                        backgroundColor: "#F8FAFC",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 12,
                            color: "#64748B",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                        }}
                    >
                        Действия
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <StatusButtons
                        status={status}
                        callNext={callNext}
                        onAccept={onAccept}
                        onComplete={onComplete}
                        onRedirect={onRedirect}
                        isLoading={isLoading}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default ClientCard;