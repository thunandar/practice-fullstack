import usePagination from "@/src/hooks/usePagination";
import { GetOwnerData, GetOwnerDataTypes, ownerDelete } from "@/src/lib/owner";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setOwnerDatas } from "@/src/store/slices/ownerSlice";
import { OwnerDataType } from "@/src/types/owner";
import { badgeColorChange, changeStatus } from "@/src/utils/checkStatus";
import { getAccessToken } from "@/src/utils/utils";
import { DeleteIcon, SearchIcon, ViewIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  TableContainer,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import React, { useEffect, useMemo, useState } from "react";
import Loading from "../Custom/Loading";
import CustomTable from "../Table/Table";
import CustomModal from "../Custom/CustomModal";
import { useRouter } from "next/navigation";
import {
  setDeleteLoading,
  setFetchLoading,
  setTotal_count, 
} from "@/src/store/slices/globalSlice";

const OwnerComponent = () => {
  const [ownerData, setOwnerData] = useState<OwnerDataType[]>([]);
  const accessToken = getAccessToken();

  const [credentialObj, setCredentialObj] = useState<GetOwnerDataTypes>({
    status: "all",
    access_token: accessToken,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { limit, onPaginationChange, skip, pagination } = usePagination();
  const { total_count, isFetchLoading } = useAppSelector(
    (state) => state.global
  );
  const [ownerDataForDelete, setOwnerDataForDelete] = useState<number | null>(
    null
  );

  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();

  useEffect(() => {
    GetAllOwnerList();
  }, [credentialObj.status, pagination]);

  async function GetAllOwnerList() {
    const obj = {
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
    };
    dispatch(setFetchLoading(true));
    const result = await GetOwnerData({ ...credentialObj, ...obj });
    dispatch(setOwnerDatas(result.data));
    const updatedArray = changeStatus(result.data);
    setOwnerData(updatedArray);
    dispatch(setTotal_count(result.total_count));
    dispatch(setFetchLoading(false));
  }

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

  const inputFilterIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCredentialObj({
      ...credentialObj,
      search: event.target.value,
    });
  };

  const handleViewDetail = (owner: OwnerDataType) => {
    router.push(`/owner/${owner.id}`);
  };

  const handleDelete = (owner: OwnerDataType) => {
    setOwnerDataForDelete(owner.id);
    onOpen();
  };

  const deleteComfirmFun = async () => {
    if (ownerDataForDelete) {
      dispatch(setDeleteLoading(true));
      const delobj = { id: ownerDataForDelete };
      const result = await ownerDelete(delobj);
      if (result.status === 0) toastFun("Success", result.message, "success");
      if (result.status === 1) toastFun("Error", result.message, "error");
      onClose();
      dispatch(setDeleteLoading(false));
      GetAllOwnerList();
    }
    return;
  };

  const columns = useMemo<ColumnDef<OwnerDataType, React.ReactNode>[]>(
    () => [
      {
        header: "Id",
        accessorKey: "id",
      },
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
        header: "Status",
        accessorKey: "status",
        cell: ({ row }: CellContext<OwnerDataType, React.ReactNode>) => (
          <Badge
            bg={badgeColorChange(row.original.status)}
            px={4}
            py={1}
            borderRadius={4}
            width={"100%"}
            fontSize="0.9em"
            textTransform="capitalize"
            variant="solid"
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        header: "Business Name",
        accessorKey: "business_name",
      },
      {
        header: "Address",
        accessorKey: "address",
        cell: ({ row }: CellContext<OwnerDataType, React.ReactNode>) => (
          <Box>
            {row.original.address ? (
              <Text>{row.original.address}</Text>
            ) : (
              <Text> - </Text>
            )}
          </Box>
        ),
      },
      {
        id: "actions",
        cell: ({ row }: CellContext<OwnerDataType, React.ReactNode>) => (
          <Flex gap={3}>
            <Button
              colorScheme="blue"
              leftIcon={<ViewIcon />}
              onClick={() => handleViewDetail(row.original)}
            >
              Details
            </Button>
            <Button
              colorScheme="red"
              leftIcon={<DeleteIcon />}
              onClick={() => handleDelete(row.original)}
            >
              Delete
            </Button>
          </Flex>
        ),
      },
    ],
    []
  );

  const pageCount = total_count
    ? Math.ceil(total_count / pagination.pageSize)
    : 0;

  const filterByIdFun = () => {
    GetAllOwnerList();
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCredentialObj({ ...credentialObj, status: event.target.value });
  };

  return (
    <Box w={"100%"} mt={3}>
      <Flex
        justifyContent={"space-between"}
        alignItems={"center"}
        flexWrap={{ base: "wrap", md: "nowrap" }}
        w={"100%"}
      >
        <Text fontSize={25} fontWeight={800}>
          Owner
        </Text>

        <Flex
          width={"100%"}
          alignItems={"start"}
          justifyContent={{ base: "start", md: "end" }}
          flexWrap={"wrap"}
        >
          <InputGroup size="md" width="fit-content">
            <Input placeholder="Search" onChange={inputFilterIdChange} />
            <InputRightElement>
              <Button type="submit" onClick={filterByIdFun}>
                <SearchIcon />
              </Button>
            </InputRightElement>
          </InputGroup>
          <Select
            value={credentialObj.status}
            ml={{ base: 0, md: 2 }}
            mt={{ base: 2, md: 0 }}
            w={"200px"}
            onChange={handleChange}
          >
            <option value="all">All</option>
            <option value="0">Pending</option>
            <option value="1">Approved</option>
            <option value="2">Blocked</option>
            <option value="3">Failed</option>
          </Select>
        </Flex>
      </Flex>
      {isFetchLoading && ownerData?.length < 1 ? (
        <Loading />
      ) : (
        <TableContainer>
          <CustomTable
            data={ownerData}
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
        modalText={`Are you sure to Delete Owner Id ${ownerDataForDelete} ?`}
        actionFun={deleteComfirmFun}
        actionText={"Delete"}
      />
    </Box>
  );
};

export default OwnerComponent;
