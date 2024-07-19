"use client";
import Loading from "@/src/components/Custom/Loading";
import ShowDetailComponent from "@/src/components/Custom/ShowDetailComponent";
import usePagination from "@/src/hooks/usePagination";
import { GetOwnerData, GetOwnerDataTypes } from "@/src/lib/owner";
import { useAppSelector } from "@/src/store/hooks";
import { OwnerDataType } from "@/src/types/owner";
import { changeStatus } from "@/src/utils/checkStatus";
import { getAccessToken } from "@/src/utils/utils";
import { Box } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

const ViewDetail = ({ params }: { params: { id: string } }) => {
  const ownerData = useAppSelector((state) => state.owner.data);
  const selectedOwnerData = ownerData.find(
    (item) => item.id === Number(params.id)
  );

  const accessToken = getAccessToken();
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [foundOwnerData, setFoundOwnerData] = useState<OwnerDataType>();
  const [isLoading, setIsLoading] = useState(false);
  const [credentialObj, setCredentialObj] = useState<GetOwnerDataTypes>({
    status: "all",
    access_token: accessToken,
  });
  const { pagination } = usePagination();

  useEffect(() => {
    if (!selectedOwnerData) findOwner();
  }, []);

  async function findOwner() {
    const obj = {
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
    };
    setIsLoading(true);
    const result = await GetOwnerData({ ...credentialObj, ...obj });
    const originalData = result.data[0];
    setFoundOwnerData(originalData);
    setIsLoading(false);
  }

  return (
    <Box>
      {isLoading && <Loading />}
      {selectedOwnerData && (
        <ShowDetailComponent ownerDataForShowDetail={selectedOwnerData} />
      )}
      {!selectedOwnerData && foundOwnerData && (
        <ShowDetailComponent ownerDataForShowDetail={foundOwnerData} />
      )}
    </Box>
  );
};

export default ViewDetail;
