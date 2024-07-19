import React from "react";

import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  Tr,
  Thead,
  Th,
  Tbody,
  Td,
  Box,
  Flex,
  Select,
  TableContainer,
  Divider,
} from "@chakra-ui/react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
interface TableProps<T> {
  data?: T | undefined;
  columns: ColumnDef<T, React.ReactNode>[];
  onPaginationChange?: React.Dispatch<
    React.SetStateAction<{
      pageSize: number;
      pageIndex: number;
    }>
  >;
  pageCount?: number;
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
}

const CustomTable: React.FC<TableProps<any>> = ({
  columns,
  data,
  onPaginationChange,
  pagination,
  pageCount,
}) => {
  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    state: { pagination },
    onPaginationChange,
    pageCount,
  });

  return (
    <>
      <Box mt={5}>
        <Flex justifyContent={"end"} alignItems={"center"} gap={"20px"}>
          <Flex ml={{ base: 5, md: 0 }}>
            <Select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(parseInt(e.target.value))}
            >
              {[10, 20, 30, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </Flex>
          <Flex alignItems={"center"} gap={"10px"}>
            <button
              disabled={!table.getCanPreviousPage()}
              onClick={table.previousPage}
              className="paginationButton"
            >
              <IoIosArrowBack />
            </button>
            <span>{`page ${
              table.getState().pagination.pageIndex + 1
            } of ${table.getPageCount()}`}</span>
            <button disabled={!table.getCanNextPage()} onClick={table.nextPage}>
              <IoIosArrowForward className="paginationButton" />
            </button>
          </Flex>
        </Flex>
      </Box>
      <Divider mt={4} />
      <TableContainer mt={"5px"}>
        <Table variant="striped">
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((column) => (
                  <Th key={column.id}>
                    {flexRender(
                      column.column.columnDef.header,
                      column.getContext()
                    )}
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <Tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Td>
                  ))}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};

export default CustomTable;
