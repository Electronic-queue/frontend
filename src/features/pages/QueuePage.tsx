import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import StatusCard from '../../components/StatusCard';
import CheckMarkIcon from '../../assets/CheckMarkIcon';
import CancelIcon from '../../assets/CancelIcon';
import ExclamationMarkIcon from '../../assets/ExclamationMarkIcon';
import LoadingIcon from '../../assets/LoadingIcon';
const QueuePage = () => {
  const { t } = useTranslation('translation');

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      height="100vh"
    >
      {/* <p>{t('I18N_QUEUE_MANAGEMENT')}</p> */}

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
        number={5}
      />
    </Stack>
  );
};

export default QueuePage;
