import React, { FC } from "react";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import { styled } from "@mui/material/styles";

interface CustomSearchInputProps {
    placeholder?: string;
    icon?: React.ReactNode;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    width?: string | number;
    height?: string | number;
    borderColor?: string;
    borderRadius?: string | number;
    backgroundColor?: string;
    iconPosition?: "left" | "right";
}

const StyledInputContainer = styled(Box)<{
    width?: string | number;
    height?: string | number;
    borderColor?: string;
    borderRadius?: string | number;
    backgroundColor?: string;
}>(({ theme, width, height, borderColor, borderRadius, backgroundColor }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    width: width || "100%",
    height: height || "40px",
    border: `1px solid ${borderColor || theme.palette.divider}`,
    borderRadius: borderRadius || theme.shape.borderRadius,
    backgroundColor: backgroundColor || theme.palette.background.paper,
    padding: theme.spacing(0, 2),
    boxSizing: "border-box",
    overflow: "hidden",
}));

const StyledInputBase = styled(InputBase)({
    flex: 1,
    fontSize: "16px",
    outline: "none",
    border: "none",
});

const CustomSearchInput: FC<CustomSearchInputProps> = ({
    placeholder = "Search...",
    icon,
    value,
    onChange,
    width,
    height,
    borderColor,
    borderRadius,
    backgroundColor,
    iconPosition = "left",
}) => {
    return (
        <StyledInputContainer
            width={width}
            height={height}
            borderColor={borderColor}
            borderRadius={borderRadius}
            backgroundColor={backgroundColor}
        >
            {iconPosition === "left" && icon}
            <StyledInputBase
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
            {iconPosition === "right" && icon}
        </StyledInputContainer>
    );
};

export default CustomSearchInput;
