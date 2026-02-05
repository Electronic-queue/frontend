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
    Paper,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import SULogoCustom from "src/assets/su-logoCustom";
import { SULogoM, SULogoMDark } from "src/assets";
import { useTheme } from "@mui/material/styles";
import CustomButton from "src/components/Button";
import connection, { startSignalR } from "src/features/signalR";
import i18n from "src/i18n";

import {
    useGetQueueTypeQuery,
    useObserverMutation,
} from "src/store/managerApi";

// --- TYPES ---
type ObserverItem = {
    recordId: number;
    ticketNumber: number;
    windowNumber: number;
    serviceNameRu: string;
    serviceNameKk: string;
    serviceNameEn: string;
    statusId: number;
    clientNumber: number | null;
};

type ObserverData = {
    calledQueue: ObserverItem[];
    inLineQueue: ObserverItem[];
    calledCount: number;
    inLineCount: number;
    queueTypeId: string;
};

// --- CONSTANTS ---
const ITEMS_PER_COLUMN = 7;

// --- STYLES ---
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

const MonitorContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#f4f6f8",
    padding: theme.spacing(2),
    overflow: "hidden",
}));

const HeaderBox = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-around",
    gap: theme.spacing(4),
    alignItems: "center",
    marginBottom: theme.spacing(2),
    height: "90px",
}));

const HeaderTypography = styled(Typography)(({ theme }) => ({
    fontSize: "26px",
    fontWeight: 200,
    color: theme.palette.text.primary,
    width: "780px",
    textAlign: "center",
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
}));

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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontSize: "1.8rem",
    fontWeight: 600,
    padding: theme.spacing(1.5),
    borderBottom: "1px solid rgba(224, 224, 224, 1)",
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
    fontSize: "20px",
    fontWeight: 700,
    backgroundColor: "#e0e0e0",
    color: "#979deb",
    padding: theme.spacing(1),
}));



const FooterTicker = styled(Box)(({ theme }) => ({
    height: "30px", // Немного увеличил высоту для удобства
    backgroundColor: "#1976d2",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    width: "100%",
    marginTop: theme.spacing(2),
}));





const TickerWrapper = styled(Box)`
  display: flex;
  white-space: nowrap;
  /* Анимация смещает контейнер влево на 50% (длина одного набора текста) */
  animation: ticker-loop 20s linear infinite;

  @keyframes ticker-loop {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  &:hover {
    animation-play-state: paused;
  }
`;

const TickerContent = styled(Typography)`
  font-size: 1.6rem;
  font-weight: 600;
  text-transform: uppercase;
  padding-right: 50px; /* Отступ между повторами текста */
  display: inline-block;
`;

const SubTable = ({
    items,
    type,
}: {
    items: ObserverItem[];
    type: "wait" | "called";
}) => {
    return (
        <Table stickyHeader>
            <TableHead>
                <TableRow>
                    <StyledHeaderCell>Талон</StyledHeaderCell>
                    <StyledHeaderCell align="right">Окно</StyledHeaderCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {items.map((item) => (
                    <TableRow
                        key={item.recordId}
                        hover
                        sx={
                            type === "called"
                                ? {
                                    animation: `pulse-green 2s infinite`,
                                    backgroundColor:
                                        "rgba(232, 245, 233, 0.5)",
                                }
                                : {}
                        }
                    >
                        {type === "wait" && (
                            <>
                                <StyledTableCell
                                    sx={{ fontWeight: 700, color: "#333" }}
                                >
                                    {item.ticketNumber}
                                </StyledTableCell>
                                <StyledTableCell
                                    align="right"
                                    sx={{ fontSize: "1.4rem", color: "#666" }}
                                >
                                    {item.windowNumber}
                                </StyledTableCell>
                            </>
                        )}
                        {type === "called" && (
                            <>
                                <StyledTableCell
                                    sx={{
                                        color: "#2e7d32",
                                        fontSize: "2rem",
                                        fontWeight: 800,
                                    }}
                                >
                                    {item.ticketNumber}
                                </StyledTableCell>
                                <StyledTableCell
                                    align="right"
                                    sx={{ fontSize: "2rem", fontWeight: 800 }}
                                >
                                    {item.windowNumber}
                                </StyledTableCell>
                            </>
                        )}
                    </TableRow>
                ))}
                {items.length === 0 && (
                    <TableRow>
                        <StyledTableCell
                            colSpan={2}
                            align="center"
                            sx={{ borderBottom: "none" }}
                        />
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};

const MonitorPage = () => {
    const theme = useTheme();
    const { t } = useTranslation();

    const [step, setStep] = useState<"select" | "monitor">("select");
    const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);
    const [monitorData, setMonitorData] = useState<ObserverData | null>(null);

    const { data: queueTypes, isLoading: isTypesLoading } =
        useGetQueueTypeQuery();
    const [registerObserver] = useObserverMutation();

    const hasRegisteredRef = useRef(false);
    const lastAnnouncedRecordId = useRef<number | null>(null);

    // --- ИЗМЕНЕННАЯ ФУНКЦИЯ ОЗВУЧКИ (Взята из CallPage) ---
    const speakText = (ticket: number | string, windowNum: number | string) => {
        // Отменяем предыдущую речь
        window.speechSynthesis.cancel();

        const lang = i18n.language;
        let text = "";
        let voiceLang = "ru-RU";

        if (lang === "kz" || lang === "kk") {
            text = `Талон номири ${ticket}, сизди ${windowNum} терезеге шакырамыз`;
            voiceLang = "kk-KZ";
        } else if (lang === "en") {
            text = `Ticket number ${ticket}, you are called to window ${windowNum}`;
            voiceLang = "en-US";
        } else {
            text = `Талон номер ${ticket}, вас вызывают к окну номер ${windowNum}`;
            voiceLang = "ru-RU";
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = voiceLang;

        utterance.rate = 1;

        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        if (step !== "monitor" || !selectedQueueId) return;

        let isMounted = true;

        const initMonitor = async () => {
            if (hasRegisteredRef.current) return;

            try {
                if (connection.state !== "Connected") {
                    await startSignalR();
                }

                let attempts = 0;
                while (!connection.connectionId && attempts < 10) {
                    if (!isMounted) return;
                    await new Promise((r) => setTimeout(r, 500));
                    attempts++;
                }

                const connId = connection.connectionId;

                if (connId) {
                    await registerObserver({
                        connectionId: connId,
                        queueTypeId: selectedQueueId,
                    }).unwrap();
                    hasRegisteredRef.current = true;
                }
            } catch (error) {
                console.error("❌ Monitor Error:", error);
            }
        };

        initMonitor();

        connection.on("ObserverUpdate", (data: ObserverData) => {
            if (data.queueTypeId === selectedQueueId) {
                setMonitorData(data);

                // --- ПРОВЕРКА НА НОВЫЙ ВЫЗОВ ---
                const newestCall = data.calledQueue[0];
                if (newestCall) {
                    if (newestCall.recordId !== lastAnnouncedRecordId.current) {
                        lastAnnouncedRecordId.current = newestCall.recordId;
                        setTimeout(() => {
                            speakText(
                                newestCall.ticketNumber,
                                newestCall.windowNumber
                            );
                        }, 500);
                    }
                }
                // -------------------------------
            }
        });

        return () => {
            isMounted = false;
            hasRegisteredRef.current = false;
            connection.off("ObserverUpdate");
            window.speechSynthesis.cancel();
        };
    }, [step, selectedQueueId, registerObserver]);

    if (step === "select") {
        return (
            <SelectionContainer>
                <Box sx={{ paddingBottom: theme.spacing(4) }}>
                    {theme.palette.mode === "dark" ? (
                        <SULogoMDark />
                    ) : (
                        <SULogoM />
                    )}
                </Box>

                <SelectionCard>
                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom
                        fontWeight="bold"
                    >
                        Выберите очередь
                    </Typography>
                    <Typography
                        variant="body1"
                        align="center"
                        color="textSecondary"
                        sx={{ mb: 3 }}
                    >
                        Для отображения на мониторе
                    </Typography>

                    {isTypesLoading ? (
                        <Box display="flex" justifyContent="center" mt={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Stack spacing={2}>
                            {[...(queueTypes?.value || [])]
                                .reverse()
                                .map((q: any) => (
                                    <CustomButton
                                        key={q.queueTypeId}
                                        variantType="primary"
                                        onClick={() => {
                                            setSelectedQueueId(q.queueTypeId);
                                            setStep("monitor");
                                        }}
                                    >
                                        {i18n.language === "en"
                                            ? q.nameEn
                                            : i18n.language === "kz"
                                                ? q.nameKk
                                                : q.nameRu}
                                    </CustomButton>
                                ))}
                        </Stack>
                    )}
                </SelectionCard>
            </SelectionContainer>
        );
    }

    // Данные для колонок
    const waitList = monitorData?.inLineQueue || [];
    const waitListLeft = waitList.slice(0, ITEMS_PER_COLUMN);
    const waitListRight = waitList.slice(
        ITEMS_PER_COLUMN,
        ITEMS_PER_COLUMN * 2
    );

    const calledList = monitorData?.calledQueue || [];
    const calledListLeft = calledList.slice(0, ITEMS_PER_COLUMN);
    const calledListRight = calledList.slice(
        ITEMS_PER_COLUMN,
        ITEMS_PER_COLUMN * 2
    );

    return (
        <MonitorContainer>
            <HeaderBox>
                <HeaderTypography>Қазақ ұлттық техникалық зерттеу университеті</HeaderTypography>
                <SULogoCustom />
                <HeaderTypography>Казахский национальный исследовательский технический университет</HeaderTypography>

            </HeaderBox>

            <Grid container spacing={3} sx={{ flex: 1, overflow: "hidden" }}>
                {/* ЛЕВАЯ КОЛОНКА */}
                <Grid item xs={6} sx={{ height: "100%" }}>
                    <Paper
                        elevation={6}
                        sx={{
                            height: "95%",
                            borderRadius: 3,
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            marginTop: theme.spacing(3),
                        }}
                    >
                        <TableTitle sx={{ backgroundColor: "#1976d2" }}>
                            В очереди
                        </TableTitle>
                        <TableContainer
                            sx={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "row",
                            }}
                        >
                            {waitList.length === 0 ? (
                                <Box
                                    sx={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography
                                        variant="h4"
                                        color="textSecondary"
                                    >
                                        Очередь пуста
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    <Box
                                        sx={{
                                            flex: 1,
                                            borderRight: "1px solid #e0e0e0",
                                        }}
                                    >
                                        <SubTable
                                            items={waitListLeft}
                                            type="wait"
                                        />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <SubTable
                                            items={waitListRight}
                                            type="wait"
                                        />
                                    </Box>
                                </>
                            )}
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* ПРАВАЯ КОЛОНКА */}
                <Grid item xs={6} sx={{ height: "100%" }}>
                    <Paper
                        elevation={6}
                        sx={{
                            height: "95%",
                            borderRadius: 3,
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            marginTop: theme.spacing(3),
                        }}
                    >
                        <TableTitle sx={{ backgroundColor: "#2e7d32" }}>
                            Вызванные
                        </TableTitle>
                        <TableContainer
                            sx={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "row",
                            }}
                        >
                            {calledList.length === 0 ? (
                                <Box
                                    sx={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography
                                        variant="h4"
                                        color="textSecondary"
                                    >
                                        Нет активных вызовов
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    <Box
                                        sx={{
                                            flex: 1,
                                            borderRight: "1px solid #e0e0e0",
                                        }}
                                    >
                                        <SubTable
                                            items={calledListLeft}
                                            type="called"
                                        />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <SubTable
                                            items={calledListRight}
                                            type="called"
                                        />
                                    </Box>
                                </>
                            )}
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            <style>
                {`
          @keyframes pulse-green {
            0% { background-color: rgba(232, 245, 233, 0.5); }
            50% { background-color: rgba(165, 214, 167, 0.6); }
            100% { background-color: rgba(232, 245, 233, 0.5); }
          }
        `}
            </style>

            <Box
                position="fixed"
                bottom={0}
                left={0}
                p={1}
                sx={{ opacity: 0, "&:hover": { opacity: 1 } }}
            >
                <CustomButton
                    variantType="danger"
                    sizeType="small"
                    onClick={() => {
                        setStep("select");
                        setMonitorData(null);
                        hasRegisteredRef.current = false;
                        lastAnnouncedRecordId.current = null;
                        connection.off("ObserverUpdate");
                    }}
                >
                    Reset
                </CustomButton>
            </Box>
            <FooterTicker>
                <TickerWrapper>
                    {/* Текст выводится дважды для создания бесшовного цикла */}
                    <TickerContent>
                        Очередь можно отслеживать через мобильный телефон •
                        Кезекті ұялы телефон арқылы бақылауға болады •
                        Scan QR code to track your queue •
                    </TickerContent>
                    <TickerContent>
                        Очередь можно отслеживать через мобильный телефон •
                        Кезекті ұялы телефон арқылы бақылауға болады •
                        Scan QR code to track your queue •
                    </TickerContent>
                </TickerWrapper>
            </FooterTicker>
        </MonitorContainer>
    );
};

export default MonitorPage;
