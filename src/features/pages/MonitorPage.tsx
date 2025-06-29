import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    styled,
} from "@mui/material";
import SULogoCustom from "src/assets/su-logoCustom";

// 🔹 Типизация данных талонов
type Ticket = {
    ticket: string;
    room: string;
    window: string;
};

// 🔹 Пример данных (в будущем — из SignalR)
const ticketData: Ticket[] = [
    { ticket: "233", room: "04", window: "01" },
    { ticket: "34", room: "04", window: "02" },
    { ticket: "35", room: "04", window: "03" },
    { ticket: "36", room: "04", window: "04" },
];

const MAX_ROWS = 5;

// 🔧 Фикс: всегда берём последние MAX_ROWS * 2 записей
const getTableData = (data: Ticket[]) => {
    const MAX = MAX_ROWS * 2;
    const sliced = data.length > MAX ? data.slice(-MAX) : data;

    return {
        left: sliced.slice(0, MAX_ROWS),
        right: sliced.slice(MAX_ROWS),
    };
};

// 🔵 Styled Components
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
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    flex: 1,
}));

const VideoWrapper = styled(Box)(({ theme }) => ({
    width: 460,
    height: 320,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ddd",
    borderRadius: theme.spacing(1),
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
    const { left, right } = getTableData(ticketData);

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

                <VideoWrapper>
                    <iframe
                        width="420"
                        height="280"
                        src="https://www.youtube.com/embed/K6Dm6po-QW4?si=wacWTyFOydyv5gcq"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    ></iframe>
                </VideoWrapper>
            </MainContent>
        </PageContainer>
    );
};

export default MonitorPage;
