import { FC } from 'react';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import PageLinks from './PageLinks';
import SULogo from '../assets/SULogo';
import UserLogo from '../assets/UserLogo';
import LanguageSwitcher from './LanguageSwitcher';

const HeaderContainer = styled(Stack)(({ theme }) => ({
  width: '100%',
  backgroundColor: 'white',
  padding: `${theme.spacing(2)} ${theme.spacing(6)}`,
  alignItems: 'center',
  position: 'static',
  top: 0,
  zIndex: 1000,
  borderBottom: '1px solid #F3F3FD',
  boxShadow: '0px 2px 7px rgba(0, 0, 0, 0.25)',
}));

const LinksContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(5),
}));

const RightSection = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(2),
  justifyContent: 'flex-end',
}));

const Header: FC = () => {
  const { t } = useTranslation('translation');
  const navigate = useNavigate();

  const handleGoQueue = () => navigate('/queue');
  const handleGoStatistics = () => navigate('/static');

  return (
    <HeaderContainer direction="row" justifyContent="space-between">
      <Stack justifyContent="flex-start">
        <SULogo />
      </Stack>

      <Stack direction="row" justifyContent="center" flexGrow={1}>
        <LinksContainer>
          <PageLinks
            onClick={handleGoQueue}
            link={{ to: '/queue', label: t('I18N_QUEUE_MANAGEMENT') }}
          />
          <PageLinks
            onClick={handleGoStatistics}
            link={{ to: '/static', label: t('I18N_STATISTICS') }}
          />
        </LinksContainer>
      </Stack>

      <RightSection>
        <LanguageSwitcher />
        <UserLogo />
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;
