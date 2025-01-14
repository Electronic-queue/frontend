import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import StatusCard from '../../components/StatusCard';
import CheckMarkIcon from '../../assets/CheckMarkIcon';
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

      <StatusCard icon={<CheckMarkIcon />} text={t('accepteds')} number={5} />
    </Stack>
  );
};

export default QueuePage;
