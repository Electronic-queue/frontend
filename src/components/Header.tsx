import { Stack, styled } from '@mui/material';
import PageLinks from './PageLinks';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SULogo from '../assets/SULogo';
import UserLogo from '../assets/UserLogo';

const HeaderContainer = styled(Stack)(({ theme }) => ({
  width: '100%',
  backgroundColor: 'white',
  padding: `${theme.spacing(2)} ${theme.spacing(6)}`,
  alignItems: 'center',
  position: 'static',
  top: 0,
  zIndex: 1000,
  borderBottom: '1px solid #F3F3FD',
  boxShadow: '0px 2px 7px rgba(0, 0, 0, 0.25)', // Тень
}));

const LinksContainer = styled(Stack)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(5),
}));

const Header = () => {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();

  const handleGoQueue = () => navigate('/queue');
  const handleGoStatistics = () => navigate('/static');

  return (
    <HeaderContainer direction="row" justifyContent="space-between">
      <Stack justifyContent="flex-start">
        <SULogo />
      </Stack>

      <Stack
        direction="row"
        justifyContent="center"
        flexGrow={1}
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <LinksContainer>
          <PageLinks
            onClick={handleGoQueue}
            link={{ to: '/queue', label: t('Управление очередью') }}
          />
          <PageLinks
            onClick={handleGoStatistics}
            link={{ to: '/static', label: t('Статистика') }}
          />
        </LinksContainer>
      </Stack>

      <Stack justifyContent="flex-end">
        <UserLogo />
      </Stack>
    </HeaderContainer>
  );
};

export default Header;
