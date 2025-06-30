import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    styled,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "src/store/store";
import SULogoCustom from "src/assets/su-logoCustom";
import { useGetQueueTypeByTokenQuery } from "src/store/managerApi";
import { useGetQueueForClientsQuery } from "src/store/managerApi";
import connection, { startSignalR } from "src/features/signalR";

type Ticket = {
    ticket: string;
    room: string;
    window: string;
};

type WatchQueueClient = {
    queueTypeId: string;
    windowNumber: number;
    nameRu: string;
    nameKk: string;
    nameEn: string;
    ticketNumber: number;
};

const MAX_ROWS = 5;

const getTableData = (data: Ticket[]) => {
    const MAX = MAX_ROWS * 2;
    const sliced = data.length > MAX ? data.slice(-MAX) : data;

    return {
        left: sliced.slice(0, MAX_ROWS),
        right: sliced.slice(MAX_ROWS),
    };
};

const PageContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#fff",
    padding: theme.spacing(4),
}));

const MainContent = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(6),
    justifyContent: "center",
    width: "100%",
    flex: 1,
}));
const VideoAndDateWrapper = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
}));

const VideoWrapper = styled(Box)(({ theme }) => ({
    // width: 460,
    // height: 320,
    // display: "flex",
    // alignItems: "center",
    // justifyContent: "center",
    // // backgroundColor: "#ddd",
    // borderRadius: theme.spacing(1),
}));

const TablesWrapper = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(4),
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    borderRadius: theme.spacing(2),
    minWidth: 280,
    maxWidth: 320,
    boxShadow: theme.shadows[4],
    backgroundColor: "#fefefe",
}));

const LargeTableCell = styled(TableCell)(({ theme }) => ({
    fontSize: "1.25rem",
    fontWeight: 600,
    textAlign: "center",
}));

const QueueTable = ({ data }: { data: Ticket[] }) => (
    <StyledTableContainer>
        <Table size="medium">
            <TableHead>
                <TableRow>
                    <LargeTableCell>Талон</LargeTableCell>
                    <LargeTableCell>Кабинет</LargeTableCell>
                    <LargeTableCell>Окно</LargeTableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {data.map((row, idx) => (
                    <TableRow key={`${row.ticket}-${idx}`}>
                        <LargeTableCell>{row.ticket}</LargeTableCell>
                        <LargeTableCell>{row.room}</LargeTableCell>
                        <LargeTableCell>{row.window}</LargeTableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </StyledTableContainer>
);

const MonitorPage = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formattedDate = new Intl.DateTimeFormat("ru-RU", {
        timeZone: "Asia/Almaty",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(currentTime);

    const formattedTime = new Intl.DateTimeFormat("ru-RU", {
        timeZone: "Asia/Almaty",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(currentTime);

    const { data: queueData } = useGetQueueForClientsQuery();

    const [queueSignalRData, setQueueSignalRData] = useState<
        WatchQueueClient[]
    >([]);
    const queueTypeId = useSelector(
        (state: RootState) => state.user.queueTypeId
    );

    const {
        data: queueTypeData,
        isLoading,
        error,
    } = useGetQueueTypeByTokenQuery();

    useEffect(() => {
        const connectSignalR = async () => {
            await startSignalR();
            connection.on(
                "QueueForWatchClients",
                (queueData: WatchQueueClient[]) => {
                    if (Array.isArray(queueData)) {
                        const filtered = queueData.filter(
                            (q) => q.queueTypeId == queueTypeId
                        );
                        console.log("Filtered Queue Data:", filtered);
                        setQueueSignalRData(filtered);
                    }
                }
            );
        };

        connectSignalR();

        return () => {
            connection.off("QueueForWatchClients");
        };
    }, [queueTypeId]);

    const ticketData: Ticket[] = queueSignalRData.map((item) => ({
        ticket: item.ticketNumber.toString(),
        room: item.nameRu, // Можно обновить, если появятся данные
        window: item.windowNumber.toString(),
    }));

    const { left, right } = getTableData(ticketData);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading queue type data</div>;
    }

    const updateData = (): void => {
        console.log(queueData);
    };
    return (
        <PageContainer>
            <Box sx={{ mb: 4 }}>
                <SULogoCustom />
            </Box>

            <MainContent>
                <TablesWrapper>
                    <QueueTable data={left} />
                    <QueueTable data={right} />
                </TablesWrapper>
                <VideoAndDateWrapper>
                    <VideoWrapper>
                        <iframe
                            width="520"
                            height="280"
                            src="https://www.youtube.com/embed/K6Dm6po-QW4?si=wacWTyFOydyv5gcq"
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    </VideoWrapper>
                    <Box sx={{ textAlign: "center", mt: 2 }}>
                        <Typography variant="h3">
                            Дата: {formattedDate}
                        </Typography>
                        <Typography variant="h3">
                            Время: {formattedTime}
                        </Typography>
                    </Box>
                </VideoAndDateWrapper>
            </MainContent>
        </PageContainer>
    );
};

export default MonitorPage;
