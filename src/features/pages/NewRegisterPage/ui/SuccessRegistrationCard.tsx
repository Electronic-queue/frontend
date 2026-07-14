import { Box, Button, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import { CreatedRecordResponse } from "../model/types";

interface SuccessRegistrationCardProps {
    data: CreatedRecordResponse | null;
    onCreateAnother: () => void;
}

export const SuccessRegistrationCard = ({
    data,
    onCreateAnother,
}: SuccessRegistrationCardProps) => {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                textAlign: "center",
                py: 1,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 72,
                    height: 72,
                    mx: "auto",
                    mb: 2,
                    borderRadius: "50%",
                    backgroundColor: "#dcfce7",
                }}
            >
                <Typography
                    sx={{
                        fontSize: 35,
                        color: "#16a34a",
                        fontWeight: 800,
                    }}
                >
                    ✓
                </Typography>
            </Box>

            <Typography
                sx={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#111827",
                }}
            >
                {t("successRegistrationCard.title")}
            </Typography>

            <Typography
                sx={{
                    mt: 0.8,
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: "#64748b",
                }}
            >
                {t("successRegistrationCard.description")}
            </Typography>

            {data?.ticketNumber !== undefined && (
                <Box
                    sx={{
                        mt: 3,
                        p: 2.5,
                        borderRadius: "20px",
                        color: "#ffffff",
                        background:
                            "linear-gradient(135deg, #3678dc 0%, #2159cc 100%)",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 14,
                            fontWeight: 600,
                            opacity: 0.9,
                        }}
                    >
                        {t("successRegistrationCard.ticketLabel")}
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.5,
                            fontSize: 40,
                            fontWeight: 800,
                            lineHeight: 1.1,
                        }}
                    >
                        №{data.ticketNumber}
                    </Typography>
                </Box>
            )}

            {data?.recordId !== undefined && (
                <Typography
                    sx={{
                        mt: 1.5,
                        fontSize: 13,
                        color: "#64748b",
                    }}
                >
                    {t("successRegistrationCard.recordNumber", {
                        recordId: data.recordId,
                    })}
                </Typography>
            )}

            <Button
                fullWidth
                onClick={onCreateAnother}
                sx={{
                    mt: 3,
                    minHeight: 48,
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
                {t("successRegistrationCard.actions.createAnother")}
            </Button>
        </Box>
    );
};