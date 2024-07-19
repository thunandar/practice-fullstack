import { Box, Button, Flex, TableContainer, Text, } from "@chakra-ui/react";
import React, { useEffect, useMemo, useRef, useState,CSSProperties } from "react";
import Loading from "../Custom/Loading";
import CustomTable from "../Table/Table";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { getAccessToken } from "@/src/utils/utils";
import usePagination from "@/src/hooks/usePagination";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { BookingListsReturnDataType } from "@/src/types/bookingLists";
import { GetBookingListsTypes, getBookingLists } from "@/src/lib/bookingLists";
import DateRangePicker from "../Custom/DateRangePicker";
import { formattedDate } from "@/src/utils/checkStatus";
import { ViewIcon } from "@chakra-ui/icons";
import BookingListsDetailsModal, {
  DetailsModalRef,
} from "./BookingListsDetailsModal";
import { setIsLoading } from "@/src/store/slices/ownerSlice";
import { ExportIcon } from "@/icons/ExportIcon";
import NotFound from "../Custom/NotFound";
import {
  setFetchLoading,
  setTotal_count,
} from "@/src/store/slices/globalSlice";
import { GetOwnerData } from "@/src/lib/owner";
import { setOwnerDatas } from "@/src/store/slices/ownerSlice";

import Select from 'react-select';

type OptionType = {
  value: string;
  label: string;
};

const BookingListsComponent = () => {
  const { isFetchLoading, total_count } = useAppSelector(
    (state) => state.global
  );
  const [bookingList, setBookingList] = useState<BookingListsReturnDataType[]>(
    []
  );
  const today = new Date();
  const [ownerId, setOwnerId] = useState<string>("all");
  const { data } = useAppSelector((state) => state.owner);

  const dispatch = useAppDispatch();
  const accessToken = getAccessToken();
  const [credentialObj, setCredentialObj] = useState<GetBookingListsTypes>({
    from: null,
    to: null,
    access_token: accessToken,
    exportcsv: false,
  });
  const { onPaginationChange, pagination } = usePagination();
  let perPage = useAppSelector((state) => state.global.credential.per_page);
  const obj = {
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
  };
  const pageCount = total_count
    ? Math.ceil(total_count / pagination.pageSize)
    : 0;

    useEffect(() => {
      GetAllBookingLists();
    }, [pagination]);

    useEffect(() => {
      GetOwnerListForBooking();
    }, [pagination]);

  useEffect(() => {
    if (
      credentialObj.from !== null &&
      credentialObj.from.length > 0 &&
      credentialObj.to !== null &&
      credentialObj.to.length > 0
    ) {
      GetAllBookingLists();
    }
  }, [pagination, credentialObj.to]);

  const detailsModalRef = useRef<DetailsModalRef>(null);

  const handleDetailsModal = (bookingLists: BookingListsReturnDataType) => {
    if (detailsModalRef.current) {
      detailsModalRef.current.open(bookingLists);
    }
  };

  const GetAllBookingLists = async () => {
   const result = await getBookingLists({ ...credentialObj, ...obj }); 
   setBookingList(result.data); 
    dispatch(setTotal_count(result.total_count));
    dispatch(setFetchLoading(false));
  };

  async function GetOwnerListForBooking() {
    dispatch(setFetchLoading(true));
    const obj = {
      page: pagination.pageIndex + 1, 
      per_page: perPage,
    };
    const result = await GetOwnerData(obj);
    dispatch(setOwnerDatas(result.data));
    dispatch(setFetchLoading(false));
  }

  const handleExport = async () => {
    const result = await getBookingLists({
      ...credentialObj,
      exportcsv: true,
      ...obj,
    }); 

    const blob = new Blob([result], {
      type: "data:text/csv;charset=utf-8,",
    });
    const blobURL = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.download = "bookingLists.csv";
    anchor.href = blobURL;
    anchor.dataset.downloadurl = [
      "text/csv",
      anchor.download,
      anchor.href,
    ].join(":");
    anchor.click();
  };

  const columns = useMemo<
    ColumnDef<BookingListsReturnDataType, React.ReactNode>[]
  >(
    () => [
      {
        header: "User Name",
        accessorKey: "user.name",
      },
      {
        header: "Booking Date",
        accessorKey: "booking_date",
      },
      {
        header: "Booking Time",
        accessorKey: "booking_time",
        cell: ({
          row,
        }: CellContext<BookingListsReturnDataType, React.ReactNode>) => (
          <Text>
            {row.original.booking_time && row.original.booking_time.join(" / ")}
          </Text>
        ),
      },
      {
        header: "Court Name",
        accessorKey: "court.name",
      },
      {
        header: "Owner",
        accessorKey: "owner.name",
        cell: ({
          row,
        }: CellContext<BookingListsReturnDataType, React.ReactNode>) => (
          <Text>
            {row.original.owner === null ? " --- " : row.original.owner.name}
          </Text>
        ),
      },
      {
        header: "Total Price",
        accessorKey: "total_amount",
      },
      {
        header: "Discount Price",
        accessorKey: "discount_amount",
      },

      {
        id: "actions",
        cell: ({
          row,
        }: CellContext<BookingListsReturnDataType, React.ReactNode>) => (
          <Flex gap={3}>
            <Button
              colorScheme="blue"
              leftIcon={<ViewIcon />}
              onClick={() => handleDetailsModal(row.original)}
            >
              Details
            </Button>
          </Flex>
        ),
      },
    ],
    []
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onMenuOpen = () => setIsMenuOpen(true);
  const onMenuClose = () => setIsMenuOpen(false);

  const [selectedOwner, setSelectedOwner] = useState<OptionType | null>(null);; 

  const handleChange = (selectedOption: OptionType | null) => {
    setSelectedOwner(selectedOption);
  };

  return (
    <>
      <Flex
        mt={3}
        alignItems={"center"}
        flexWrap={"wrap"}
        justifyContent="space-between"
      >
        <Text fontSize={25} fontWeight={800}>
          Booking Lists
        </Text>
        <Box display={"flex"}>
          <Select        
            onMenuOpen={onMenuOpen}
            onMenuClose={onMenuClose}
            value={selectedOwner}
            onChange={handleChange}
            options={data.map(item => ({ value: item.id.toString(), label: item.name }))}
            styles={{
              control: (base) => ({
                ...base,
                width: '240px', 
                height: '42px',
                marginRight: '20px', 
              }),
            }}
          />        
          <DateRangePicker
            credentialObj={credentialObj}
            setCredentialObj={setCredentialObj}
          />
          <Button
            onClick={handleExport}
            bgColor={"#5A66F1"}
            color={"white"}
            _hover={{ bgColor: "#30388c" }}
            ml={4}
          >
            <ExportIcon style={{ marginRight: "10px", color: "white" }} />
            Export
          </Button>
        </Box>
      </Flex>
        {isFetchLoading ? (
        <Loading />
      ) : bookingList.length < 1 ? (
        <NotFound name="Bookinglists" />
      ) : (
        <TableContainer>
          <CustomTable
            data={bookingList.filter(
              (item) =>
                selectedOwner === null || item.owner?.name === selectedOwner?.label
            )}
            columns={columns}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            pageCount={pageCount}
          />
        </TableContainer>
      )}
      <BookingListsDetailsModal title={"Details"} ref={detailsModalRef} />
    </>
  );
};

export default BookingListsComponent;
