import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

const QueuePage = () => {
  const { t } = useTranslation('translation');

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      height="100vh"
    >
      <p>{t('I18N_QUEUE_MANAGEMENT')}</p>
    </Stack>
  );
};

export default QueuePage;
