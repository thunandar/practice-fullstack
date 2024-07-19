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
import { DeleteIcon, AddIcon, ViewIcon } from "@chakra-ui/icons";
import { CellContext, ColumnDef } from "@tanstack/react-table";

import CustomModal from "@/src/components/Custom/CustomModal";
import CustomTable from "@/src/components/Table/Table";
import Loading from "../Custom/Loading";
import usePagination from "@/src/hooks/usePagination";
import ViewModal, { ViewModalRef } from "./modal/View";
import { DateTimeFormat } from "@/src/utils";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import NotFound from "../Custom/NotFound";
import { ContactMessageData } from "@/src/types/help";
import {
  DeleteContactMessage,
  GetContactMessages,
} from "@/src/lib/helpAndSupport";
import { getAccessToken } from "@/src/utils/utils";
import { setHelpAndSupportData } from "@/src/store/slices/helpAndSupportSlice";
import {
  setDeleteLoading,
  setFetchLoading,
  setTotal_count,
} from "@/src/store/slices/globalSlice";

const HelpAndSupportPage = () => {
  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessageData | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    onPaginationChange,
    pagination: { pageIndex, pageSize },
  } = usePagination();
  const { data } = useAppSelector((state) => state.helpAndSupport);
  const { isFetchLoading, total_count } = useAppSelector(
    (state) => state.global
  );
  const toast = useToast();
  const dispatch = useAppDispatch();
  const accessToken = getAccessToken();

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
    try {
      dispatch(setFetchLoading(true));
      const obj = {
        page: pageIndex + 1,
        per_page: pageSize,
        access_token: accessToken,
      };
      const result = await GetContactMessages(obj);
      dispatch(setHelpAndSupportData(result.data));
      dispatch(setTotal_count(result.total_count));
      dispatch(setFetchLoading(false));
    } catch (err: any) {
      toastFun("Error", err.message, "error");
    }
  }
  const pageCount = total_count ? Math.ceil(total_count / pageSize) : 0;

  const viewModalRef = useRef<ViewModalRef>(null);

  const handleViewModal = (sportTypes: ContactMessageData) => {
    if (viewModalRef.current) {
      viewModalRef.current.open(sportTypes);
    }
  };

  const handleDelete = (sportTypes: ContactMessageData) => {
    setSelectedMessage(sportTypes);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (selectedMessage) {
      dispatch(setDeleteLoading(true));
      const delobj = { id: selectedMessage.id };
      const res = await DeleteContactMessage(delobj);
      if (res.status === 1) {
        toastFun("Error", res.message || res.errors.message, "error");
      } else if (res.status === 0) {
        toastFun("Success", res.message, "success");
      }
      onClose();
      dispatch(setDeleteLoading(false));
      GetAllSportTypes();
    }
  };

  const columns = useMemo<ColumnDef<ContactMessageData, React.ReactNode>[]>(
    () => [
      {
        header: "Owner",
        accessorKey: "owner",
        cell: ({
          row,
        }: CellContext<ContactMessageData, React.ReactNode> | any) => (
          <Text>{row.original.owner ? row.original.owner.name : "-"}</Text>
        ),
      },
      {
        header: "Employee",
        accessorKey: "employee",
        cell: ({
          row,
        }: CellContext<ContactMessageData, React.ReactNode> | any) => (
          <Text>
            {row.original.employee ? row.original.employee.name : "-"}
          </Text>
        ),
      },
      {
        header: "User",
        accessorKey: "user",
        cell: ({
          row,
        }: CellContext<ContactMessageData, React.ReactNode> | any) => (
          <Text>{row.original.user?.name}</Text>
        ),
      },
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({
          row,
        }: CellContext<ContactMessageData, React.ReactNode> | any) => (
          <Text>{DateTimeFormat(row.original.createdAt, "date")}</Text>
        ),
      },
      {
        id: "actions",
        cell: ({ row }: CellContext<ContactMessageData, React.ReactNode>) => (
          <Flex gap={3}>
            <Button
              colorScheme="blue"
              onClick={() => handleViewModal(row.original)}
              leftIcon={<ViewIcon />}
            >
              View
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
          Help & Support
        </Text>
      </Flex>
      {isFetchLoading ? (
        <Loading />
      ) : data.length < 1 ? (
        <NotFound name="Messages" />
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

      <ViewModal ref={viewModalRef} title="Details" />
    </>
  );
};

export default HelpAndSupportPage;
