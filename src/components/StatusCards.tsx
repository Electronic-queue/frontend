import StatusCard from './StatusCard';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import CheckMarkIcon from '../assets/CheckMarkIcon';
import CancelIcon from '../assets/CancelIcon';
import ExclamationMarkIcon from '../assets/ExclamationMarkIcon';
import LoadingIcon from '../assets/LoadingIcon';
const StatusCardWrapper = styled(Stack)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(3),
  justifyContent: 'center',
  height: '100vh',
  marginTop: theme.spacing(3),
}));

const StatusCards = () => {
  const { t } = useTranslation('translation');
  return (
    <StatusCardWrapper>
      <StatusCard icon={<CheckMarkIcon />} text={t('accepteds')} number={75} />
      <StatusCard icon={<CancelIcon />} text={t('not_accepteds')} number={3} />
      <StatusCard
        icon={<ExclamationMarkIcon />}
        text={t('redirected')}
        number={5}
      />
      <StatusCard
        icon={<LoadingIcon />}
        text={t('in_anticipation')}
        number={8}
      />
    </StatusCardWrapper>
  );
};

export default StatusCards;
