"use client";
import CustomModal from "@/src/components/Custom/CustomModal";
import CustomTable from "@/src/components/Table/Table";
import { EditIcon, DeleteIcon, AddIcon, SearchIcon } from "@chakra-ui/icons";
import {
  Text,
  TableContainer,
  Flex,
  Button,
  useDisclosure,
  useToast,
  Spinner,
  InputGroup,
  Input,
  InputRightElement,
  Box,
  Select,
} from "@chakra-ui/react";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useRef, useState } from "react";
import usePagination from "@/src/hooks/usePagination";
import { DateTimeFormat } from "@/src/utils";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import Loading from "../Custom/Loading";
import {
  setDeleteLoading,
  setFetchLoading,
  setPerPage,
  setTotal_count,
} from "@/src/store/slices/globalSlice";
import { DeleteTownship, GetTownshipList } from "@/src/lib/township";
import {
  removeTownship,
  setTownshipData,
} from "@/src/store/slices/townshipSlice";
import { TownshipDataType } from "@/src/types/township";
import { GetRegionList } from "@/src/lib/region";
import { setRegionData } from "@/src/store/slices/regionSlice";
import TownshipCreateModal, {
  TownshipCreateModalRef,
} from "./modal/TownshipCreateModal";
import TownshipEditModal, {
  TownshipEditModalRef,
} from "./modal/TownshipEditModal";

const TownShipComponent = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [townshipDataForDelete, setTownshipDataForDelete] = useState<
    number | null
  >(null);
  const { total_count, isFetchLoading } = useAppSelector(
    (state) => state.global
  );
  let perPage = useAppSelector((state) => state.global.credential.per_page);
  const [regionId, setRegionId] = useState<string>("all");
  const { onPaginationChange, pagination } = usePagination();
  const { townshipData } = useAppSelector((state) => state.township);
  const { regionData } = useAppSelector((state) => state.region);
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
    GetAllTownship();
  }, [pagination, regionId]);

  useEffect(() => {
    GetRegionListForTownship();
  }, [perPage]);

  async function GetAllTownship() {
    dispatch(setFetchLoading(true));
    const obj = {
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
    };
    const result = await GetTownshipList({ ...obj, region_id: regionId });
    dispatch(setTownshipData(result.data));
    dispatch(setTotal_count(result.total_count));
    dispatch(setFetchLoading(false));
  }

  async function GetRegionListForTownship() {
    dispatch(setFetchLoading(true));
    const obj = {
      page: pagination.pageIndex + 1, 
      per_page: perPage,
    };
    const result = await GetRegionList(obj);
    dispatch(setRegionData(result.data));
    dispatch(setFetchLoading(false));
  }

  const pageCount = total_count
    ? Math.ceil(total_count / pagination.pageSize)
    : 0;

  const createTownshipModalRef = useRef<TownshipCreateModalRef>(null);
  const editTownshipModalRef = useRef<TownshipEditModalRef>(null);

  const handleCreateModal = () => {
    if (createTownshipModalRef.current) {
      createTownshipModalRef.current.open();
    }
  };

  const handleEditModal = (region: TownshipDataType) => {
    if (editTownshipModalRef.current) {
      editTownshipModalRef.current.open(region);
    }
  };

  const handleDelete = (region: TownshipDataType) => {
    setTownshipDataForDelete(region.id as number);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (townshipDataForDelete) {
      dispatch(setDeleteLoading(true));
      const delobj = { id: townshipDataForDelete };
      const deleteRegionData = townshipData.find(
        (item) => item.id === delobj.id
      );
      await DeleteTownship(delobj as TownshipDataType);
      toastFun("Success", "Delete Success", "success");
      dispatch(removeTownship(deleteRegionData as TownshipDataType));
      dispatch(setDeleteLoading(false));
      onClose();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRegionId(event.target.value);
  };

  const columns = useMemo<ColumnDef<TownshipDataType, React.ReactNode>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Region Name",
        cell: ({ row }: CellContext<TownshipDataType, React.ReactNode>) => (
          <Text>{row.original.region ? row.original.region.name : " - "}</Text>
        ),
      },
      {
        id: "actions",
        cell: ({ row }: CellContext<TownshipDataType, React.ReactNode>) => (
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
      <Box mt={3} justifyContent="space-between" alignItems={"center"}>
        <Text
          fontSize={25}
          fontWeight={800}
          mb={{ base: 3, md: 0 }}
          ml={{ base: 4, md: 0 }}
        >
          Township
        </Text>
        <Flex
          width={"100%"}
          alignItems={"start"}
          justifyContent={"end"}
          flexWrap={"wrap"}
          mr={5}
        >
          {regionData.length > 0 && (
            <Select
              value={regionId}
              onChange={handleChange}
              width={{ xl: "20%" }}
              disabled={isFetchLoading}
              mr={3}
            >
              <option value={"all"}>All</option>
              {regionData.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          )}
          <Text
            color={"#185aca"}
            cursor={"pointer"}
            textAlign={"center"}
            fontSize={{ base: "13px", md: "15px" }}
            my={"auto"}
            onClick={() => {
              dispatch(setPerPage((perPage += 10)));
            }}
            mr={{ base: 5, md: 0 }}
            display={isFetchLoading ? "none" : "block"}
          >
            Load more
          </Text>
        </Flex>
        <Box
          display={"flex"}
          justifyContent={"flex-end"}
          mr={{ base: 5, md: 0 }}
        >
          <Button colorScheme="blue" onClick={handleCreateModal} mt={4}>
            <AddIcon fontSize={{ base: "13px", md: "18px" }} mr={2} />
            <Text display={{ base: "none", md: "block" }}>Create</Text>
          </Button>
        </Box>
      </Box>
      {isFetchLoading && townshipData?.length < 1 ? (
        <Loading />
      ) : (
        <TableContainer>
          <CustomTable
            data={townshipData}
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
      <TownshipCreateModal
        ref={createTownshipModalRef}
        title="Create Township"
        fetchData={GetAllTownship}
      />
      <TownshipEditModal
        ref={editTownshipModalRef}
        title="Edit Township"
        fetchData={GetAllTownship}
      />
    </>
  );
};

export default TownShipComponent;
