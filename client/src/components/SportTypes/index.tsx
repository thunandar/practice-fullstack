"use client";

import {
  Text,
  TableContainer,
  Flex,
  Button,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { EditIcon, DeleteIcon, AddIcon } from "@chakra-ui/icons";
import { CellContext, ColumnDef } from "@tanstack/react-table";

import CustomModal from "@/src/components/Custom/CustomModal";
import CustomTable from "@/src/components/Table/Table";
import Loading from "../Custom/Loading";
import usePagination from "@/src/hooks/usePagination";
import CreateModal, { MyModalRef } from "./modal/Create";
import EditModal, { EditModalRef } from "./modal/Edit";
import { DateTimeFormat } from "@/src/utils";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { DeleteSportType, GetSportTypesList } from "@/src/lib/sportTypes";
import { setSportTypesData } from "@/src/store/slices/sportTypesSlice";
import { SportTypesData } from "@/src/types/sportType";
import NotFound from "../Custom/NotFound";
import {
  setDeleteLoading,
  setFetchLoading,
  setTotal_count,
} from "@/src/store/slices/globalSlice";

const SportTypesPage = () => {
  const [selectedSportType, setSelectedSportType] =
    useState<SportTypesData | null>(null);
  const { total_count, isFetchLoading } = useAppSelector(
    (state) => state.global
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    onPaginationChange,
    pagination: { pageIndex, pageSize },
  } = usePagination();
  const { data } = useAppSelector((state) => state.sportTypes);
  const toast = useToast();
  const dispatch = useAppDispatch();

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
    GetAllSportTypes();
  }, [pageIndex, pageSize]);

  async function GetAllSportTypes() {
    dispatch(setFetchLoading(true));
    try {
      const obj = {
        page: pageIndex + 1,
        per_page: pageSize,
      };
      const result = await GetSportTypesList(obj);

      dispatch(setSportTypesData(result.data));
      dispatch(setTotal_count(result.total_count));
      dispatch(setFetchLoading(false));
    } catch (err: any) {
      toastFun("Error", err.message, "error");
    }
  }
  const pageCount = total_count ? Math.ceil(total_count / pageSize) : 0;

  const createModalRef = useRef<MyModalRef>(null);
  const editModalRef = useRef<EditModalRef>(null);

  const handleCreateModal = () => {
    if (createModalRef.current) {
      createModalRef.current.open();
    }
  };

  const handleEditModal = (sportTypes: SportTypesData) => {
    if (editModalRef.current) {
      editModalRef.current.open(sportTypes);
    }
  };

  const handleDelete = (sportTypes: SportTypesData) => {
    setSelectedSportType(sportTypes);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (selectedSportType) {
      dispatch(setDeleteLoading(true));
      const delobj = { id: selectedSportType.id };
      const res = await DeleteSportType(delobj);
      if (res.status === 1) {
        toastFun("Error", res.message || res.errors.message, "error");
      } else if (res.status === 0) {
        toastFun("Success", res.message, "success");
        GetAllSportTypes();
      }
      dispatch(setDeleteLoading(false));
      onClose();
    }
  };

  const columns = useMemo<ColumnDef<SportTypesData, React.ReactNode>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Icon",
        accessorKey: "icon",
      },
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ row }: CellContext<SportTypesData, React.ReactNode> | any) => (
          <Text>{DateTimeFormat(row.original.createdAt, "date")}</Text>
        ),
      },
      {
        id: "actions",
        cell: ({ row }: CellContext<SportTypesData, React.ReactNode>) => (
          <Flex gap={3}>
            <Button
              colorScheme="blue"
              onClick={() => handleEditModal(row.original)}
              leftIcon={<EditIcon />}
            >
              Edit
            </Button>
            <Button
              colorScheme="red"
              onClick={() => handleDelete(row.original)}
              leftIcon={<DeleteIcon />}
            >
              Delete
            </Button>
          </Flex>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Flex mt={3} justifyContent="space-between" alignItems={"center"}>
        <Text fontSize={25} fontWeight={800}>
          Sport Types
        </Text>
        <Button
          colorScheme="blue"
          onClick={handleCreateModal}
          leftIcon={<AddIcon />}
        >
          Create
        </Button>
      </Flex>
      {isFetchLoading ? (
        <Loading />
      ) : data.length < 1 ? (
        <NotFound name="Sport Types" />
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
      <CustomModal
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        modalTitle={"Delete"}
        modalText={"Are you sure you want to delete?"}
        actionFun={handleDeleteConfirm}
        actionText={"Delete"}
      />
      <CreateModal
        ref={createModalRef}
        title="Create Sport Type"
        fetchData={GetAllSportTypes}
      />
      <EditModal
        ref={editModalRef}
        title="Edit Sport Type"
        fetchData={GetAllSportTypes}
      />
    </>
  );
};

export default SportTypesPage;
