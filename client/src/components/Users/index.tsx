"use client";
import { useEffect, useMemo, useState } from "react";
import { Box, Flex, TableContainer, Text, useToast } from "@chakra-ui/react";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";

import { Tag, UserData } from "@/src/types/user";
import { GetUserList, SearchUserList } from "@/src/lib/users";
import { DateTimeFormat } from "@/src/utils";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setUserData } from "@/src/store/slices/userSlice";
import CustomTable from "../Table/Table";
import SearchBar from "./SearchBar";
import usePagination from "@/src/hooks/usePagination";
import Loading from "../Custom/Loading";
import NotFound from "../Custom/NotFound";

function UsersPage() {
  const [totalCount, setTotalCount] = useState<number | undefined>();
  const { data, isLoading } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const toast = useToast();

  const {
    onPaginationChange,
    pagination: { pageIndex, pageSize },
  } = usePagination();
  const searchParams = useSearchParams();
  const search = searchParams.get("search");

  const toastFun = (
    condition: string,
    description: string,
    statusInd: "error" | "success"
  ) => {
    toast({
      position: "top-right",
      title: condition,
      description: description,
      status: statusInd,
      duration: 3000,
      isClosable: true,
    });
  };

  useEffect(() => {
    fetchData();
  }, [search, pageIndex, pageSize]);

  async function fetchData() {
    try {
      let result;
      if (search) {
        result = await SearchUserList({
          page: pageIndex + 1,
          per_page: pageSize,
          value: search,
        });
      } else {
        result = await GetUserList({
          page: pageIndex + 1,
          per_page: pageSize,
        });
      }
      dispatch(setUserData(result.data));
      setTotalCount(result.total_count);
    } catch (error: any) {
      toastFun("Error", error.message, "error");
    }
  }

  const pageCount = totalCount ? Math.ceil(totalCount / pageSize) : 0;

  const columns = useMemo<ColumnDef<UserData, React.ReactNode>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Email",
        accessorKey: "email",
      },
      {
        header: "Phone",
        accessorKey: "phone",
      },
      {
        header: "Region",
        accessorKey: "region",
        cell: ({ row }: CellContext<UserData, React.ReactNode>) => (
          <Text>{row.original.region ? row.original.region.name : " - "}</Text>
        ),
      },
      {
        header: "Township",
        accessorKey: "township",
        cell: ({ row }: CellContext<UserData, React.ReactNode>) => (
          <Text>
            {row.original.township ? row.original.township.name : " - "}
          </Text>
        ),
      },
      {
        header: "Sport Types",
        accessorKey: "sport types",
        cell: ({ row }: CellContext<UserData, React.ReactNode> | any) => (
          <Box>
            {row.original.tags &&
              row.original.tags.map((sport: Tag) => (
                <Text key={sport.sport_type_id}>{sport.name}</Text>
              ))}
          </Box>
        ),
      },
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ row }: CellContext<UserData, React.ReactNode>) => (
          <Text>
            {row.original.createdAt &&
              DateTimeFormat(row.original.createdAt, "date")}
          </Text>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Flex
        mt={3}
        alignItems={"center"}
        flexWrap={"wrap"}
        justifyContent="space-between"
      >
        <Text fontSize={25} fontWeight={800}>
          Users
        </Text>
        <Box>
          <SearchBar />
        </Box>
      </Flex>

      {isLoading && data?.length < 1 ? (
        <Loading />
      ) : data.length < 1 ? (
        <NotFound name="Users" />
      ) : (
        <TableContainer>
          <CustomTable
            data={data}
            columns={columns}
            pagination={{ pageIndex, pageSize }}
            onPaginationChange={onPaginationChange}
            pageCount={pageCount}
          />
        </TableContainer>
      )}
    </>
  );
}

export default UsersPage;
