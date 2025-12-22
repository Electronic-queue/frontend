import React, { FC } from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { ButtonProps } from "@mui/material/Button";
import Box from "@mui/material/Box";

interface CustomButtonProps extends ButtonProps {
    variantType?: "primary" | "secondary" | "danger";
    sizeType?: "small" | "medium" | "large";
    icon?: React.ReactElement;
}

const StyledButton = styled(
    ({ sizeType, variantType, ...rest }: CustomButtonProps) => (
        <Button {...rest} />
    )
)(({ theme, variantType, sizeType, disabled }) => {
    const isDark = theme.palette.mode === 'dark';

    const variants = {
        primary: {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.getContrastText(theme.palette.primary.main),
            "&:hover": {
                backgroundColor: theme.palette.primary.dark,
            },
        },
        secondary: {
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.getContrastText(theme.palette.secondary.main),
            "&:hover": {
                backgroundColor: theme.palette.secondary.dark,
            },
        },
        danger: {
            backgroundColor: theme.palette.error.main,
            color: theme.palette.getContrastText(theme.palette.error.main),
            "&:hover": {
                backgroundColor: theme.palette.error.dark,
            },
        },
        disabled: {
            backgroundColor: isDark ? theme.palette.grey[800] : theme.palette.grey[300],
            color: isDark ? theme.palette.grey[600] : theme.palette.grey[500],
            cursor: "not-allowed",
            "&:hover": {
                backgroundColor: isDark ? theme.palette.grey[800] : theme.palette.grey[300],
            },
        },
    };

    const fontSizes = {
        small: theme.typography.body2.fontSize, 
        medium: theme.typography.body1.fontSize, 
        large: theme.typography.h6.fontSize, 
    };

    return {
        ...(disabled ? variants.disabled : variants[variantType || "primary"]),
        fontSize: fontSizes[sizeType || "medium"],
        fontWeight: 600,
        textTransform: "none",
        padding: theme.spacing(1, 3),
        borderRadius: theme.shape.borderRadius,
        transition: theme.transitions.create(['background-color', 'box-shadow', 'color'], {
            duration: theme.transitions.duration.short,
        }),
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
            disableElevation
            {...rest}
        >
            {icon && (
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mr: 1,
                    '& svg': { fontSize: '1.2em' } 
                }}>
                    {icon}
                </Box>
            )}
            {children}
        </StyledButton>
    );
};

export default CustomButton;