import React, { FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { styled } from '@mui/material/styles';

interface StatusCardProps {
  icon: React.ReactElement<SvgIconProps>;
  text: string;
  number: number;
}

const CardContainer = styled(Box)(({ theme }) => ({
  width: theme.spacing(33),
  height: theme.spacing(11),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: '2px 4px 10px rgba(0, 0, 0, 0.25)',
}));

const IconAndTextWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const StatusCard: FC<StatusCardProps> = ({ icon, text, number }) => {
  return (
    <CardContainer>
      <IconAndTextWrapper>
        {icon}
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {text}
        </Typography>
      </IconAndTextWrapper>
      <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
        {number}
      </Typography>
    </CardContainer>
  );
};

export default StatusCard;
