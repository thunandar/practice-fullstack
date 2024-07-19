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
import { PricingDataType } from "@/src/types/pricing";
import usePagination from "@/src/hooks/usePagination";
import { DateTimeFormat } from "@/src/utils";
import { DeletePricing, GetPricingList } from "@/src/lib/pricing";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setPricingData } from "@/src/store/slices/pricingSlice";
import Loading from "../Custom/Loading";
import Image from "next/image";

const RegionPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [selectedPricing, setSelectedPricing] = useState<PricingDataType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState<number | undefined>();
  const { onPaginationChange, pagination } = usePagination();
  const data = useAppSelector((state) => state.pricing.data);
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
    GetAllPricing();
  }, [pagination]);


  async function GetAllPricing() {
    setIsLoading(true);
    const obj = {
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
    };
    const result = await GetPricingList(obj);
    dispatch(setPricingData(result.data));
    setTotalCount(result.total_count);
    setIsLoading(false);
  }

  const pageCount = totalCount
    ? Math.ceil(totalCount / pagination.pageSize)
    : 0;

  const createModalRef = useRef<MyModalRef>(null);
   const editModalRef = useRef<EditModalRef>(null);

  const handleCreateModal = () => {
    if (createModalRef.current) {
      createModalRef.current.open();
    }
  };

  const handleEditModal = (pricing: PricingDataType) => {
    if (editModalRef.current) {
      editModalRef.current.open(pricing);
    }
  };
  
  const handleDelete = (pricing: PricingDataType) => {
    setSelectedPricing(pricing);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (selectedPricing) {
      const delobj = { id: selectedPricing.id };
      await DeletePricing(delobj);
      toastFun("Success", "Delete Success", "success");
      GetAllPricing();
      onClose();
    }
  };

  const columns = useMemo<ColumnDef<PricingDataType, React.ReactNode>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Monthly",
        accessorKey: "price.halfYearly",
      },
      {
        header: "Quarterly",
        accessorKey: "price.halfYearly",
      },
      {
        header: "Half Yearly",
        accessorKey: "price.halfYearly",
      },
      {
        header: "Yearly",
        accessorKey: "price.yearly",
      },
      {
        header: "Court Limit",
        accessorKey: "court_limit",
      },
      {
        header: "Notification Limit",
        accessorKey: "push_notification_limit",
      },
      {
        header: "Marketing Post Limit",
        accessorKey: "marketing_post_limit",
      },
      {
        header: "Order",
        accessorKey: "order",
      },
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ row }: CellContext<PricingDataType, React.ReactNode> | any) => (
          <Text>{DateTimeFormat(row.original.createdAt, "date")}</Text>
        ),
      },
      {
        id: "actions",
        cell: ({ row }: CellContext<PricingDataType, React.ReactNode>) => (
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
          Pricing
        </Text>
        <Button
          colorScheme="blue"
          onClick={handleCreateModal}
          leftIcon={<AddIcon />}
        >
          Create
        </Button>
      </Flex>
      {isLoading && data.length < 1 ? (
        <Loading />
      ) : (
        <TableContainer>
          <CustomTable
            data={data}
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
      <CreateModal ref={createModalRef} title="Create Pricing" />
      <EditModal ref={editModalRef} title="Edit Pricing" />
    </>
  );
};

export default RegionPage;
