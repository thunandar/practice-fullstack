"use client";
import CustomModal from "@/src/components/Custom/CustomModal";
import CustomTable from "@/src/components/Table/Table";
import { DeleteAdmin, GetAdminList } from "@/src/lib/admin";
import { EditIcon, DeleteIcon, AddIcon } from "@chakra-ui/icons";
import {
  Text,
  TableContainer,
  Flex,
  Button,
  useDisclosure,
  useToast,
  Badge,
  useBoolean,
} from "@chakra-ui/react";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useRef, useState } from "react";
import CreateModal, { MyModalRef } from "./modal/Create";
import EditModal, { EditModalRef } from "./modal/Edit";
import { AdminDataType } from "@/src/types/admin";
import usePagination from "@/src/hooks/usePagination";
import { getAccessToken } from "@/src/utils/utils";
import Loading from "../Custom/Loading";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { removeAdmin, setAdminData } from "@/src/store/slices/adminSlice";
import {
  setDeleteLoading,
  setFetchDataStatus,
  setFetchLoading,
  setTotal_count,
} from "@/src/store/slices/globalSlice";

const roleMapping: Record<number, string> = {
  0: "Admin",
  1: "Moderator",
};

export const changeStatus = (resultdata: AdminDataType[]) => {
  return resultdata?.map((item: AdminDataType) => ({
    ...item,
    status: roleMapping[Number(item.role)],
  }));
};

export const badgeColorChange = (value: string | number | undefined) => {
  if (value === 0) return "#b21515";
  if (value === 1) return "#334499";
};

const AdminPage = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { limit, onPaginationChange, skip, pagination } = usePagination();
  const accessToken = getAccessToken();
  const adminData = useAppSelector((state) => state.admin.adminData);
  const { isFetchLoading, fetchDataStatus, total_count, deleteLoading } =
    useAppSelector((state) => state.global);
  const dispatch = useAppDispatch();
  const [selectedAdmin, setSelectedAdmin] = useState<AdminDataType | null>(
    null
  );

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
    if (fetchDataStatus) {
      GetAllAdminList();
      dispatch(setFetchDataStatus(false)); // Set the flag to false after fetching data
    }
  }, [pagination.pageIndex, pagination.pageSize, fetchDataStatus]);

  useEffect(() => {
    dispatch(setFetchDataStatus(true));
  }, [pagination.pageIndex, pagination.pageSize]);

  async function GetAllAdminList() {
    const obj = {
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      access_token: accessToken,
    };
    dispatch(setFetchLoading(true));
    const result = await GetAdminList(obj);
    dispatch(setAdminData(result.data));
    dispatch(setTotal_count(result.total_count));
    dispatch(setFetchLoading(false));
  }

  const handleDelete = (admin: AdminDataType) => {
    setSelectedAdmin(admin);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (selectedAdmin) {
      dispatch(setDeleteLoading(true));
      const delobj = { id: selectedAdmin.id };
      const deleteAdminData = adminData.find((item) => item.id === delobj.id);
      await DeleteAdmin(delobj);
      toastFun("Success", "Delete Success", "success");
      dispatch(removeAdmin(deleteAdminData as AdminDataType));
      dispatch(setDeleteLoading(false));
      onClose();
    }
  };

  const pageCount = total_count
    ? Math.ceil(total_count / pagination.pageSize)
    : 0;

  const createModalRef = useRef<MyModalRef>(null);
  const editModalRef = useRef<EditModalRef>(null);

  const handleCreateModal = () => {
    if (createModalRef.current) {
      createModalRef.current.open();
    }
  };

  const handleEditModal = (admin: AdminDataType) => {
    if (editModalRef.current) {
      editModalRef.current.open(admin);
    }
  };

  const columns = useMemo<ColumnDef<AdminDataType, React.ReactNode>[]>(
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
        header: "Role",
        accessorKey: "role",
        cell: ({ row }: CellContext<AdminDataType, React.ReactNode>) => (
          <Badge
            bg={badgeColorChange(row.original.role)}
            px={2}
            py={1}
            borderRadius={4}
            width={"100%"}
            fontSize="0.9em"
            textTransform="capitalize"
            variant="solid"
            textAlign="center"
          >
            <Text>{row.original.role === 0 ? "Admin" : "Moderator"}</Text>
          </Badge>
        ),
      },
      {
        id: "actions",
        cell: ({ row }: CellContext<AdminDataType, React.ReactNode>) => (
          <Flex gap={3}>
            <Button
              colorScheme="blue"
              onClick={() => handleEditModal(row.original)}
              leftIcon={<EditIcon />}
            >
              Edit
            </Button>
            <Button
              isLoading={deleteLoading}
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
          Admin
        </Text>
        <Button
          isDisabled={isFetchLoading}
          colorScheme="blue"
          onClick={handleCreateModal}
          leftIcon={<AddIcon />}
        >
          Create
        </Button>
      </Flex>
      {isFetchLoading && adminData?.length < 1 ? (
        <Loading />
      ) : (
        <TableContainer>
          <CustomTable
            data={adminData}
            columns={columns}
            pagination={pagination}
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
      <CreateModal ref={createModalRef} title="Create Admin" />
      <EditModal ref={editModalRef} title="Edit Admin" />
    </>
  );
};

export default AdminPage;
