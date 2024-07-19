"use client";
import CustomModal from "@/src/components/Custom/CustomModal";
import CustomTable from "@/src/components/Table/Table";
import { EditIcon, DeleteIcon, AddIcon } from "@chakra-ui/icons";
import {
  Text,
  TableContainer,
  Flex,
  Button,
  useDisclosure,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useRef, useState } from "react";
import CreateModal, { MyModalRef } from "./modal/Create";
import EditModal, { EditModalRef } from "./modal/Edit";
import { RegionDataType } from "@/src/types/region";
import usePagination from "@/src/hooks/usePagination";
import { DateTimeFormat } from "@/src/utils";
import { DeleteRegion, GetRegionList } from "@/src/lib/region";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { removeRegion, setRegionData } from "@/src/store/slices/regionSlice";
import Loading from "../Custom/Loading";
import Image from "next/image";
import {
  setDeleteLoading,
  setFetchLoading,
  setTotal_count,
} from "@/src/store/slices/globalSlice";

const RegionPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [selectedRegion, setSelectedRegion] = useState<RegionDataType | null>(
    null
  );
  const { total_count, isFetchLoading } = useAppSelector(
    (state) => state.global
  );

  const { onPaginationChange, pagination } = usePagination();
  const regionData = useAppSelector((state) => state.region.regionData);
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
    GetAllRegion();
  }, [pagination]);

  async function GetAllRegion() {
    dispatch(setFetchLoading(true));
    const obj = {
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
    };
    const result = await GetRegionList(obj);
    dispatch(setRegionData(result.data));
    dispatch(setTotal_count(result.total_count));
    dispatch(setFetchLoading(false));
  }

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

  const handleEditModal = (region: RegionDataType) => {
    if (editModalRef.current) {
      editModalRef.current.open(region);
    }
  };

  const handleDelete = (region: RegionDataType) => {
    setSelectedRegion(region);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (selectedRegion) {
      dispatch(setDeleteLoading(true));
      const delobj = { id: selectedRegion.id };
      const deleteRegionData = regionData.find((item) => item.id === delobj.id);
      await DeleteRegion(delobj);
      toastFun("Success", "Delete Success", "success");
      dispatch(removeRegion(deleteRegionData as RegionDataType));
      dispatch(setDeleteLoading(false));
      onClose();
    }
  };

  const columns = useMemo<ColumnDef<RegionDataType, React.ReactNode>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        id: "actions",
        cell: ({ row }: CellContext<RegionDataType, React.ReactNode>) => (
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
          Region
        </Text>
        <Button
          colorScheme="blue"
          onClick={handleCreateModal}
          leftIcon={<AddIcon />}
        >
          Create
        </Button>
      </Flex>
      {isFetchLoading && regionData?.length < 1 ? (
        <Loading />
      ) : (
        <TableContainer>
          <CustomTable
            data={regionData}
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
      <CreateModal
        ref={createModalRef}
        title="Create Region"
        fetchData={GetAllRegion}
      />
      <EditModal
        ref={editModalRef}
        title="Edit Region"
        fetchData={GetAllRegion}
      />
    </>
  );
};

export default RegionPage;
