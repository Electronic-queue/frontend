import React, { FC } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { ButtonProps } from '@mui/material/Button';
import Box from '@mui/material/Box';

interface CustomButtonProps extends ButtonProps {
  variantType?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactElement;
  disabled?: boolean;
}

const StyledButton = styled(Button)<CustomButtonProps>(({
  theme,
  variantType,
}) => {
  const variants = {
    primary: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    secondary: {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.common.white,
      '&:hover': {
        backgroundColor: theme.palette.secondary.dark,
      },
    },
    danger: {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.common.white,
      '&:hover': {
        backgroundColor: theme.palette.error.dark,
      },
    },
  };

  return variantType ? variants[variantType] : variants.primary;
});

const CustomButton: FC<CustomButtonProps> = ({
  variantType = 'primary',
  icon,
  disabled = false,
  children,
  ...rest
}) => {
  return (
    <StyledButton
      variant="contained"
      variantType={variantType}
      disabled={disabled}
      {...rest}
    >
      {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
      {children}
    </StyledButton>
  );
};

export default CustomButton;
