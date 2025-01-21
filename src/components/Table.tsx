import React, { FC } from "react";
import {
    Table as MuiTable,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

interface ReusableTableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData>[];
    pageSize?: number;
    onRowClick?: (row: TData) => void;
}

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    maxWidth: "100%",
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    fontSize: theme.typography.h6.fontSize,
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.typography.h6.fontSize,
    textAlign: "center",
}));
const StyledBodyCell = styled(TableCell)(({ theme }) => ({
    textAlign: "center",
    fontSize: theme.typography.h6.fontSize,
}));

const ReusableTable: FC<ReusableTableProps<any>> = ({
    data,
    columns,
    pageSize = 10,
    onRowClick,
}) => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(pageSize);

    const paginatedData = React.useMemo(() => {
        const start = page * rowsPerPage;
        const end = start + rowsPerPage;
        return data.slice(start, end);
    }, [data, page, rowsPerPage]);

    const tableInstance = useReactTable({
        data: paginatedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <StyledTableContainer>
            <MuiTable>
                <TableHead>
                    {tableInstance.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <StyledHeaderCell key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                          )}
                                </StyledHeaderCell>
                            ))}
                        </TableRow>
                    ))}
                </TableHead>
                <TableBody>
                    {tableInstance.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            hover
                            onClick={() => onRowClick?.(row.original)}
                            style={{
                                cursor: onRowClick ? "pointer" : "default",
                            }}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <StyledBodyCell key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </StyledBodyCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </MuiTable>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "1rem 0",
                }}
            >
                <TablePagination
                    rowsPerPageOptions={[5, 10]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage=""
                    sx={{
                        ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                            {
                                fontSize: "16px",
                            },
                        ".MuiTablePagination-select": {
                            fontSize: "16px",
                        },
                    }}
                />
            </Box>
        </StyledTableContainer>
    );
};

export default ReusableTable;
