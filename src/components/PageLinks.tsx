import { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Typography } from '@mui/material';
import { styled } from '@mui/material';

const StyledLink = styled(RouterLink)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
  '&:hover': {
    color: theme.palette.secondary.main,
  },
}));

interface IPageLink {
  to: string;
  label: string;
}

interface IPageLinksProps {
  link: IPageLink;
  onClick: (to: string) => void;
}

const PageLinks: FC<IPageLinksProps> = ({ link, onClick }) => {
  return (
    <Typography
      variant="h6"
      onClick={() => onClick(link.to)}
      sx={{ fontSize: '16px' }}
    >
      <StyledLink to={link.to}>{link.label}</StyledLink>
    </Typography>
  );
};

export default PageLinks;
