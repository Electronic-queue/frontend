import { Routes, Route } from 'react-router-dom';
import QueuePage from './features/pages/QueuePage';
import StatisticPage from './features/pages/StatisticPage';
import Header from './components/Header';
import { Stack } from '@mui/material';

const App = () => {
  return (
    <Stack
      direction="column"
      sx={{
        minHeight: '100vh',
      }}
    >
      <Header />
      {/* // написать фильтры для ролей */}
      <Routes>
        <Route path="/" element={<QueuePage />} />
        <Route path="/queue" element={<QueuePage />} />
        <Route path="/static" element={<StatisticPage />} />
      </Routes>
    </Stack>
  );
};

export default App;
