"use client";

import {
  Text,
  TableContainer,
  Flex,
  Button,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { EditIcon, DeleteIcon, AddIcon } from "@chakra-ui/icons";
import { CellContext, ColumnDef } from "@tanstack/react-table";

import CustomModal from "@/src/components/Custom/CustomModal";
import CustomTable from "@/src/components/Table/Table";
import usePagination from "@/src/hooks/usePagination";
import Loading from "../Custom/Loading";
import CreateModal, { MyModalRef } from "./modal/Create";
import EditModal, { EditModalRef } from "./modal/Edit";
import { BannerData } from "@/src/types/banner";
import { DateTimeFormat } from "@/src/utils";
import { DeleteBanner } from "@/src/lib/banner";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setBannerData } from "@/src/store/slices/bannerSlice";
import { GetBannerList } from "@/src/lib/banner";
import NotFound from "../Custom/NotFound";
import {
  setDeleteLoading,
  setFetchLoading,
  setTotal_count,
} from "@/src/store/slices/globalSlice";

const BannerPage = () => {
  const [selectedBanner, setSelectedBanner] = useState<BannerData | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data } = useAppSelector((state) => state.banner);
  const { isFetchLoading, total_count } = useAppSelector(
    (state) => state.global
  );
  const {
    onPaginationChange,
    pagination: { pageIndex, pageSize },
  } = usePagination();
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
    GetAllBanner();
  }, [pageIndex, pageSize]);

  async function GetAllBanner() {
    dispatch(setFetchLoading(true));
    try {
      const obj = {
        page: pageIndex + 1,
        per_page: pageSize,
      };
      const result = await GetBannerList(obj);
      dispatch(setBannerData(result.data));
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

  const handleEditModal = (banner: BannerData) => {
    if (editModalRef.current) {
      editModalRef.current.open(banner);
    }
  };

  const handleDelete = (banner: BannerData) => {
    setSelectedBanner(banner);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (selectedBanner) {
      dispatch(setDeleteLoading(true));
      const delobj = { id: selectedBanner.id };
      const res = await DeleteBanner(delobj);
      if (res.status === 1) {
        toastFun("Error", res.message || res.errors.message, "error");
      } else if (res.status === 0) {
        toastFun("Success", res.message, "success");
        GetAllBanner();
      }
      dispatch(setDeleteLoading(false));
      onClose();
    }
  };

  const columns = useMemo<ColumnDef<BannerData, React.ReactNode>[]>(
    () => [
      {
        header: "Image",
        accessorKey: "image",
        cell: ({ row }: CellContext<BannerData, React.ReactNode> | any) => {
          const imgUrl = row.original.web_image;
          if (imgUrl) {
            return <Image src={imgUrl} alt="image" width={100} height={100} />;
          }
          return null;
        },
      },
      {
        header: "Title",
        accessorKey: "title",
      },
      {
        header: "Body",
        accessorKey: "body",
      },
      {
        header: "Url",
        accessorKey: "url",
      },
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ row }: CellContext<BannerData, React.ReactNode> | any) => (
          <Text>{DateTimeFormat(row.original.createdAt, "date")}</Text>
        ),
      },
      {
        id: "actions",
        cell: ({ row }: CellContext<BannerData, React.ReactNode>) => (
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
          Banner
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
        <NotFound name="Banner" />
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
        title="Create Banner"
        fetchData={GetAllBanner}
      />
      <EditModal
        ref={editModalRef}
        title="Edit Banner"
        fetchData={GetAllBanner}
      />
    </>
  );
};

export default BannerPage;
