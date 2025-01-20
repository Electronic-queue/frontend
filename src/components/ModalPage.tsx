import React, { FC, ReactNode } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

interface ReusableModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children?: ReactNode;
    width?: string | number;
    height?: string | number;
    showCloseButton?: boolean;
}

const StyledModalContent = styled(Box)<{
    width?: string | number;
    height?: string | number;
}>(({ theme, width, height }) => ({
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: width || "400px",
    height: height || "auto",
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: "24px 24px 48px rgba(0, 0, 0, 0.2)",
    padding: theme.spacing(4),
    outline: "none",
}));
const TitleText = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    fontSize: theme.typography.h2.fontSize,
    color: theme.palette.primary.main,
    fontWeight: 600,
}));
const ReusableModal: FC<ReusableModalProps> = ({
    open,
    onClose,
    title,
    children,
    width,
    height,
    showCloseButton = true,
}) => {
    return (
        <Modal open={open} onClose={onClose}>
            <StyledModalContent width={width} height={height}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <TitleText>{title}</TitleText>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                        width: "100%",
                        height: "100%",
                    }}
                >
                    {children}
                </Box>
                {showCloseButton && (
                    <Box sx={{ textAlign: "right", mt: 3 }}>
                        <button
                            style={{
                                padding: "8px 16px",
                                background: "#1976d2",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                            }}
                            onClick={onClose}
                        >
                            Закрыть
                        </button>
                    </Box>
                )}
            </StyledModalContent>
        </Modal>
    );
};

export default ReusableModal;
