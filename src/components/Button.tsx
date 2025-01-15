import React, { FC } from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { ButtonProps } from "@mui/material/Button";
import Box from "@mui/material/Box";

interface CustomButtonProps extends ButtonProps {
    variantType?: "primary" | "secondary" | "danger";
    sizeType?: "small" | "medium" | "large"; // Связано с размером текста
    icon?: React.ReactElement;
    disabled?: boolean;
}

const StyledButton = styled(Button)<CustomButtonProps>(({
    theme,
    variantType,
    sizeType,
}) => {
    const variants = {
        primary: {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
            "&:hover": {
                backgroundColor: theme.palette.primary.dark,
            },
        },
        secondary: {
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.common.white,
            "&:hover": {
                backgroundColor: theme.palette.secondary.dark,
            },
        },
        danger: {
            backgroundColor: theme.palette.error.main,
            color: theme.palette.common.white,
            "&:hover": {
                backgroundColor: theme.palette.error.dark,
            },
        },
    };

    const fontSizes = {
        small: theme.typography.body1.fontSize, // 12px
        medium: theme.typography.h6.fontSize, // 16px
        large: theme.typography.h5.fontSize, // 20px
    };

    return {
        ...variants[variantType || "primary"],
        fontSize: fontSizes[sizeType || "medium"], // Подключаем размер текста
        textTransform: "none", // Отключаем автоматический uppercase
        padding: theme.spacing(1, 2), // Добавляем отступы
    };
});

const CustomButton: FC<CustomButtonProps> = ({
    variantType = "primary",
    sizeType = "medium",
    icon,
    disabled = false,
    children,
    ...rest
}) => {
    return (
        <StyledButton
            variant="contained"
            variantType={variantType}
            sizeType={sizeType}
            disabled={disabled}
            {...rest}
        >
            {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
            {children}
        </StyledButton>
    );
};

export default CustomButton;
