// src/features/pages/MonitorPage.tsx
import { useEffect, useState, useRef } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  Stack,
  CircularProgress,
  Grid,
  Paper
} from "@mui/material";
import { useTranslation } from "react-i18next";
import SULogoCustom from "src/assets/su-logoCustom";
import { SULogoM, SULogoMDark } from "src/assets";
import { useTheme } from "@mui/material/styles";
import CustomButton from "src/components/Button";
import connection, { startSignalR } from "src/features/signalR";
import i18n from "src/i18n";

// API hooks
import { 
  useGetQueueTypeQuery, 
  useObserverMutation 
} from "src/store/managerApi";

// --- ТИПЫ ДАННЫХ ---
type ObserverItem = {
  recordId: number;
  ticketNumber: number;
  windowNumber: number;
  serviceNameRu: string;
  serviceNameKk: string;
  serviceNameEn: string;
  statusId: number; // 3 - вызван, 1 - ожидает
  clientNumber: number | null;
};

type ObserverData = {
  calledQueue: ObserverItem[]; // Список вызванных (левая часть)
  inLineQueue: ObserverItem[]; // Список ожидающих (правая часть)
  calledCount: number;
  inLineCount: number;
  queueTypeId: string;
};

// --- СТИЛИ ---

// Контейнер выбора очереди
const SelectionContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.background.default,
  minHeight: "100vh",
  width: "100%",
  padding: theme.spacing(2),
}));

const SelectionCard = styled(Stack)(({ theme }) => ({
  width: "100%",
  maxWidth: theme.spacing(60),
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[4],
  backgroundColor: theme.palette.background.paper,
  maxHeight: "80vh",
  overflowY: "auto",
}));

// Контейнер Монитора
const MonitorContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  backgroundColor: "#f4f6f8", // Светло-серый фон для контраста
  padding: theme.spacing(2),
  overflow: "hidden"
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center", // Логотип по центру
  alignItems: "center",
  marginBottom: theme.spacing(2),
  height: "80px"
}));

// Заголовки таблиц
const TableTitle = styled(Typography)(({ theme }) => ({
  fontSize: "2rem",
  fontWeight: 700,
  color: "#fff",
  padding: theme.spacing(2),
  textAlign: "center",
  borderTopLeftRadius: theme.spacing(1),
  borderTopRightRadius: theme.spacing(1),
  textTransform: "uppercase",
  letterSpacing: "1px",
}));

// Ячейки таблицы (увеличенный шрифт)
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: "1.8rem", 
  fontWeight: 600,
  padding: theme.spacing(1.5),
  borderBottom: "1px solid rgba(224, 224, 224, 1)",
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  fontSize: "1.4rem",
  fontWeight: 700,
  backgroundColor: "#e0e0e0",
  color: "#333",
  padding: theme.spacing(1),
}));

const MonitorPage = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  
  // --- STATE ---
  const [step, setStep] = useState<"select" | "monitor">("select");
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);
  const [monitorData, setMonitorData] = useState<ObserverData | null>(null);
  
  // Для часов (пока закомментировано)
  // const [currentTime, setCurrentTime] = useState(new Date());

  // API
  const { data: queueTypes, isLoading: isTypesLoading } = useGetQueueTypeQuery();
  const [registerObserver] = useObserverMutation();

  const hasRegisteredRef = useRef(false);

  // --- ЧАСЫ (Закомментировано по просьбе) ---
  /*
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  */

  // --- SIGNALR ---
  useEffect(() => {
    if (step !== "monitor" || !selectedQueueId) return;

    let isMounted = true;

    const initMonitor = async () => {
        if (hasRegisteredRef.current) return;

        try {
            console.log("📺 Запуск монитора...");
            
            // 1. Подключение
            if (connection.state !== "Connected") {
                await startSignalR();
            }

            // 2. Получение ID
            let attempts = 0;
            while (!connection.connectionId && attempts < 10) {
                if (!isMounted) return;
                await new Promise((r) => setTimeout(r, 500));
                attempts++;
            }

            const connId = connection.connectionId;

            // 3. Регистрация Observer (теперь отправляется JSON body, спасибо исправлению в managerApi)
            if (connId) {
                console.log(`📡 Registering Observer: QueueType=${selectedQueueId}, ConnId=${connId}`);
                await registerObserver({
                    connectionId: connId,
                    queueTypeId: selectedQueueId
                }).unwrap();
                
                hasRegisteredRef.current = true;
            }

        } catch (error) {
            console.error("❌ Monitor Error:", error);
        }
    };

    initMonitor();

    // 4. Подписка на обновление данных
    connection.on("ObserverUpdate", (data: ObserverData) => {
        // console.log("📥 Observer Update:", data);
        if (data.queueTypeId === selectedQueueId) {
            setMonitorData(data);
        }
    });

    return () => {
        isMounted = false;
        hasRegisteredRef.current = false;
        connection.off("ObserverUpdate");
    };
  }, [step, selectedQueueId, registerObserver]);


  // --- HELPER: Получение названия услуги ---
  const getServiceName = (item: ObserverItem) => {
      const lang = i18n.language;
      if (lang === 'en') return item.serviceNameEn;
      if (lang === 'kz') return item.serviceNameKk;
      return item.serviceNameRu; // default ru
  };

  // --- RENDER: ШАГ 1 - ВЫБОР ---
  if (step === "select") {
    return (
        <SelectionContainer>
            <Box sx={{ paddingBottom: theme.spacing(4) }}>
                {theme.palette.mode === 'dark' ? <SULogoMDark /> : <SULogoM />}
            </Box>
            
            <SelectionCard>
                <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
                    Выберите очередь
                </Typography>
                <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 3 }}>
                    Для отображения на мониторе
                </Typography>
                
                {isTypesLoading ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        {[...(queueTypes?.value || [])].reverse().map((q: any) => (
                            <CustomButton 
                                key={q.queueTypeId} 
                                variantType="primary"
                                onClick={() => {
                                    setSelectedQueueId(q.queueTypeId);
                                    setStep("monitor");
                                }}
                            >
                                {i18n.language === 'en' ? q.nameEn : i18n.language === 'kz' ? q.nameKk : q.nameRu}
                            </CustomButton>
                        ))}
                    </Stack>
                )}
            </SelectionCard>
        </SelectionContainer>
    );
  }

  // --- RENDER: ШАГ 2 - МОНИТОР ---
  const calledList = monitorData?.calledQueue || [];
  const waitList = monitorData?.inLineQueue || [];

  return (
    <MonitorContainer>
      {/* Логотип */}
      <HeaderBox>
         <SULogoCustom /> 
         {/* Если нужен стандартный логотип, раскомментируйте ниже, а Custom уберите */}
         {/* <SULogoM style={{ height: '60px' }} /> */}
      </HeaderBox>

      {/* Основной контент - Таблицы на весь экран */}
      <Grid container spacing={3} sx={{ flex: 1, overflow: 'hidden' }}>
          
          {/* ЛЕВАЯ КОЛОНКА: ВЫЗВАННЫЕ (CALLED) */}
          <Grid item xs={6} sx={{ height: '100%' }}>
              <Paper elevation={6} sx={{ height: '100%', borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <TableTitle sx={{ backgroundColor: '#2e7d32' }}> {/* Зеленый заголовок */}
                      Сейчас обслуживаются
                  </TableTitle>
                  <TableContainer sx={{ flex: 1 }}>
                      <Table stickyHeader>
                          <TableHead>
                              <TableRow>
                                  <StyledHeaderCell>Талон</StyledHeaderCell>
                                  <StyledHeaderCell>Окно</StyledHeaderCell>
                                  <StyledHeaderCell align="right">Услуга</StyledHeaderCell>
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              {calledList.length > 0 ? (
                                  calledList.map((item, idx) => (
                                      <TableRow 
                                        key={item.recordId} 
                                        sx={{ 
                                            // Пульсация для привлечения внимания
                                            animation: `pulse-green 2s infinite`,
                                            backgroundColor: 'rgba(232, 245, 233, 0.5)'
                                        }}
                                      >
                                          <StyledTableCell sx={{ color: '#2e7d32', fontSize: '2.5rem', fontWeight: 800 }}>
                                              {item.ticketNumber}
                                          </StyledTableCell>
                                          <StyledTableCell sx={{ fontSize: '2.5rem', fontWeight: 800 }}>
                                              {item.windowNumber}
                                          </StyledTableCell>
                                          <StyledTableCell align="right" sx={{ fontSize: '1.4rem', color: '#555' }}>
                                              {getServiceName(item)}
                                          </StyledTableCell>
                                      </TableRow>
                                  ))
                              ) : (
                                  <TableRow>
                                      <StyledTableCell colSpan={3} align="center" sx={{ color: '#999', py: 10 }}>
                                          Нет активных вызовов
                                      </StyledTableCell>
                                  </TableRow>
                              )}
                          </TableBody>
                      </Table>
                  </TableContainer>
              </Paper>
          </Grid>

          {/* ПРАВАЯ КОЛОНКА: ОЧЕРЕДЬ (WAITING) */}
          <Grid item xs={6} sx={{ height: '100%' }}>
              <Paper elevation={6} sx={{ height: '100%', borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <TableTitle sx={{ backgroundColor: '#1976d2' }}> {/* Синий заголовок */}
                      В очереди
                  </TableTitle>
                  <TableContainer sx={{ flex: 1 }}>
                      <Table stickyHeader>
                          <TableHead>
                              <TableRow>
                                  <StyledHeaderCell>Талон</StyledHeaderCell>
                                  <StyledHeaderCell align="right">Услуга</StyledHeaderCell>
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              {waitList.length > 0 ? (
                                  waitList.slice(0, 8).map((item) => ( // Показываем топ 8, чтобы влезло
                                      <TableRow key={item.recordId} hover>
                                          <StyledTableCell sx={{ fontWeight: 700, color: '#333' }}>
                                              {item.ticketNumber}
                                          </StyledTableCell>
                                          <StyledTableCell align="right" sx={{ fontSize: '1.4rem', color: '#666' }}>
                                              {getServiceName(item)}
                                          </StyledTableCell>
                                      </TableRow>
                                  ))
                              ) : (
                                  <TableRow>
                                      <StyledTableCell colSpan={2} align="center" sx={{ color: '#999', py: 10 }}>
                                          Очередь пуста
                                      </StyledTableCell>
                                  </TableRow>
                              )}
                          </TableBody>
                      </Table>
                  </TableContainer>
              </Paper>
          </Grid>
      </Grid>

      {/* ВИДЕО И ВРЕМЯ - ЗАКОММЕНТИРОВАНО (СОХРАНЕНО НА БУДУЩЕЕ) */}
      {/* <Box sx={{ position: 'absolute', bottom: 20, right: 20, opacity: 0.8, display: 'none' }}>
          <Typography variant="h3">{formattedTime}</Typography>
          <Typography variant="h5">{formattedDate}</Typography>
      </Box> 
      */}

      {/* Стили для анимации */}
      <style>
        {`
          @keyframes pulse-green {
            0% { background-color: rgba(232, 245, 233, 0.5); }
            50% { background-color: rgba(165, 214, 167, 0.6); }
            100% { background-color: rgba(232, 245, 233, 0.5); }
          }
        `}
      </style>

      <Box position="fixed" bottom={0} left={0} p={1} sx={{ opacity: 0, '&:hover': { opacity: 1 } }}>
          <CustomButton 
            variantType="danger" 
            sizeType="small"
            onClick={() => {
                setStep("select");
                setMonitorData(null);
                hasRegisteredRef.current = false;
                connection.off("ObserverUpdate");
            }}
          >
            Reset
          </CustomButton>
      </Box>
    </MonitorContainer>
  );
};

export default MonitorPage;