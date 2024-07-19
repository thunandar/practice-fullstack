import {
  GetOwnerData,
  GetOwnerDataTypes,
  OwnerUpdateStatus,
  ownerUpdateStatus,
} from "@/src/lib/owner";
import { OwnerDataType } from "@/src/types/owner";
import {
  Box,
  Button,
  Image,
  Select,
  Tag,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import BankingInfo from "./BankingInfo";
import { getAccessToken } from "@/src/utils/utils";
import { changeStatus } from "@/src/utils/checkStatus";
import Loading from "./Loading";
import usePagination from "@/src/hooks/usePagination";

interface ShowDetailComponentProps {
  ownerDataForShowDetail?: OwnerDataType;
}

const ShowDetailComponent = ({
  ownerDataForShowDetail,
}: ShowDetailComponentProps) => {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState<OwnerUpdateStatus>({
    id: ownerDataForShowDetail && ownerDataForShowDetail.id,
    status: Number(ownerDataForShowDetail?.status),
  });
  const accessToken = getAccessToken();
  const [isBtnLoading, setIsBtnLoading] = useState(false);

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

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setValue({
      ...value,
      status: Number(event.target.value),
      access_token: accessToken,
    });
  };

  const saveFun = async () => {
    setIsBtnLoading(true);
    const result = await ownerUpdateStatus(value);
    if (result.status === 0) {
      toastFun("Success", result.message, "success");
    }
    if (result.status === 1) toastFun("Error", result.message, "error");
    setIsBtnLoading(false);
    router.push("/owner");
  };

  return (
    <Box>
      {ownerDataForShowDetail ? (
        <Box
          display={{ base: "block", lg: "flex" }}
          justifyContent={"space-between"}
          mt={{ base: 8, md: 0 }}
        >
          <Box
            mx={"auto"}
            width={{ base: "95%", sm: "90%", md: "65%", lg: "55%", xl: "50%" }}
            className="loginShadow"
            mb={{ base: 5, lg: 0 }}
            bgColor={"#EDF2F7"}
          >
            <Box px={6} py={4} bgColor={"#ccdeff"}>
              <Text fontSize={{ base: "20px", md: "1.5rem" }} fontWeight={700}>
                {ownerDataForShowDetail.name}'s Details
              </Text>
            </Box>
            <Box p={8}>
              <Box display={"flex"} alignItems={"center"}>
                <Text
                  pb={"0.5rem"}
                  width={{ base: "50%", md: "50%", lg: "40%" }}
                  fontSize={{ base: "14px", md: "17px" }}
                  fontWeight={700}
                >
                  Avatar
                </Text>
                <Box>
                  <Image
                    src={ownerDataForShowDetail.avatar}
                    alt="avatar"
                    width={100}
                    height={100}
                  />
                </Box>
              </Box>
              <Box display={"flex"} py={"1rem"}>
                <Text
                  mr={"0.4rem"}
                  width={{ base: "50%", md: "50%", lg: "40%" }}
                  fontSize={{ base: "14px", md: "17px" }}
                  fontWeight={700}
                >
                  Id{" "}
                </Text>
                <Text
                  width={{ base: "50%", lg: "60%" }}
                  fontSize={{ base: "14px", md: "16px" }}
                >
                  {ownerDataForShowDetail.id}
                </Text>
              </Box>
              <Box display={"flex"} py={"1rem"}>
                <Text
                  mr={"0.4rem"}
                  width={{ base: "50%", md: "50%", lg: "40%" }}
                  fontSize={{ base: "14px", md: "17px" }}
                  fontWeight={700}
                >
                  Name
                </Text>
                <Text
                  width={{ base: "50%", lg: "60%" }}
                  fontSize={{ base: "14px", md: "16px" }}
                >
                  {ownerDataForShowDetail.name}
                </Text>
              </Box>
              {/* <Divider orientation="horizontal" width={"100%"} border={"1px"} />  */}
              <Box display={"flex"} py={"1rem"}>
                <Text
                  mr={"0.4rem"}
                  width={{ base: "50%", md: "50%", lg: "40%" }}
                  fontSize={{ base: "14px", md: "17px" }}
                  fontWeight={700}
                >
                  Email
                </Text>
                <Text
                  width={{ base: "50%", lg: "60%" }}
                  fontSize={{ base: "14px", md: "16px" }}
                >
                  {ownerDataForShowDetail.email}
                </Text>
              </Box>
              <Box display={"flex"} py={"1rem"}>
                <Text
                  mr={"0.4rem"}
                  width={{ base: "50%", md: "50%", lg: "40%" }}
                  fontSize={{ base: "14px", md: "17px" }}
                  fontWeight={700}
                >
                  Phone
                </Text>
                <Text
                  width={{ base: "50%", lg: "60%" }}
                  fontSize={{ base: "14px", md: "16px" }}
                >
                  {ownerDataForShowDetail.phone}
                </Text>
              </Box>
              <Box display={"flex"} py={"1rem"}>
                <Text
                  mr={"0.4rem"}
                  width={{ base: "50%", md: "50%", lg: "40%" }}
                  fontSize={{ base: "14px", md: "17px" }}
                  fontWeight={700}
                >
                  Business Name
                </Text>
                <Text
                  width={{ base: "50%", lg: "60%" }}
                  fontSize={{ base: "14px", md: "16px" }}
                >
                  {ownerDataForShowDetail.business_name}
                </Text>
              </Box>
              <Box display={"flex"} py={"1rem"}>
                <Text
                  mr={"0.4rem"}
                  width={{ base: "50%", md: "50%", lg: "40%" }}
                  fontSize={{ base: "14px", md: "17px" }}
                  fontWeight={700}
                >
                  Business Email
                </Text>
                <Text
                  width={{ base: "50%", lg: "60%" }}
                  fontSize={{ base: "14px", md: "16px" }}
                >
                  {ownerDataForShowDetail.business_email}
                </Text>
              </Box>
              <Box display={"flex"} py={"1rem"}>
                <Text
                  mr={"0.4rem"}
                  width={{ base: "50%", md: "50%", lg: "40%" }}
                  fontSize={{ base: "14px", md: "17px" }}
                  fontWeight={700}
                >
                  Business Phone
                </Text>
                <Text
                  width={{ base: "50%", lg: "60%" }}
                  fontSize={{ base: "14px", md: "16px" }}
                >
                  {ownerDataForShowDetail.business_phone}
                </Text>
              </Box>
              <Box display={"flex"} py={"1rem"}>
                <Text
                  mr={"0.4rem"}
                  width={{ base: "50%", md: "50%", lg: "40%" }}
                  fontSize={{ base: "14px", md: "17px" }}
                  fontWeight={700}
                >
                  Address
                </Text>
                <Text
                  width={{ base: "50%", lg: "60%" }}
                  fontSize={{ base: "14px", md: "16px" }}
                >
                  {ownerDataForShowDetail.address}
                </Text>
              </Box>

              <Box display={"flex"} py={"1rem"}>
                <Text
                  mr={"0.4rem"}
                  width={{ base: "50%", md: "50%", lg: "40%" }}
                  fontSize={{ base: "14px", md: "17px" }}
                  fontWeight={700}
                >
                  NRC No. -
                </Text>
                <Text
                  width={{ base: "50%", lg: "60%" }}
                  fontSize={{ base: "14px", md: "16px" }}
                >
                  {ownerDataForShowDetail.nrc_no}
                </Text>
              </Box>
              <Box display={"flex"} py={"1rem"}>
                <Text
                  mr={"0.4rem"}
                  width={{ base: "50%", md: "50%", lg: "40%" }}
                  fontSize={{ base: "14px", md: "17px" }}
                  fontWeight={700}
                >
                  Created At
                </Text>
                <Text
                  width={{ base: "50%", lg: "60%" }}
                  fontSize={{ base: "14px", md: "16px" }}
                >
                  {ownerDataForShowDetail.createdAt}
                </Text>
              </Box>
              <Box display={"flex"} py={"1rem"}>
                <Text
                  mr={"0.4rem"}
                  width={{ base: "50%", md: "50%", lg: "40%" }}
                  fontSize={{ base: "14px", md: "17px" }}
                  fontWeight={700}
                >
                  Data Id
                </Text>
                <Text
                  width={{ base: "50%", lg: "60%" }}
                  fontSize={{ base: "14px", md: "16px" }}
                >
                  {ownerDataForShowDetail.data_id}
                </Text>
              </Box>

              <Box display={"flex"} py={"1rem"}>
                <Text
                  mr={"0.4rem"}
                  width={{ base: "50%", md: "50%", lg: "40%" }}
                  fontSize={{ base: "14px", md: "17px" }}
                  fontWeight={700}
                >
                  Court Limit
                </Text>
                <Text
                  width={{ base: "50%", lg: "60%" }}
                  fontSize={{ base: "14px", md: "16px" }}
                >
                  {ownerDataForShowDetail.court_limit}
                </Text>
              </Box>
              <Box display={"flex"} py={"1rem"}>
                <Text
                  mr={"0.4rem"}
                  width={{ base: "50%", md: "50%", lg: "40%" }}
                  fontSize={{ base: "14px", md: "17px" }}
                  fontWeight={700}
                >
                  Marketing Post Limit
                </Text>
                <Text
                  width={{ base: "50%", lg: "60%" }}
                  fontSize={{ base: "14px", md: "16px" }}
                >
                  {ownerDataForShowDetail.marketing_post_limit}
                </Text>
              </Box>
              <Box display={"flex"} py={"1rem"}>
                <Text
                  mr={"0.4rem"}
                  width={{ base: "50%", md: "50%", lg: "40%" }}
                  fontSize={{ base: "14px", md: "17px" }}
                  fontWeight={700}
                >
                  Push Notification Limit
                </Text>
                <Text
                  width={{ base: "50%", lg: "60%" }}
                  fontSize={{ base: "14px", md: "16px" }}
                >
                  {ownerDataForShowDetail.push_notification_limit}
                </Text>
              </Box>
              <Box display={"flex"} py={"1rem"}>
                <Text
                  mr={"0.4rem"}
                  width={{ base: "50%", md: "50%", lg: "40%" }}
                  fontSize={{ base: "14px", md: "17px" }}
                  fontWeight={700}
                >
                  Lang
                </Text>
                <Text
                  width={{ base: "50%", lg: "60%" }}
                  fontSize={{ base: "14px", md: "16px" }}
                >
                  {ownerDataForShowDetail.lang}
                </Text>
              </Box>
            </Box>
          </Box>
          <Box
            width={{ base: "95", sm: "90%", md: "65%", lg: "40%", xl: "45%" }}
            mx={"auto"}
          >
            <Box className="loginShadow" p={8} bgColor={"#EDF2F7"}>
              <Box
                py={"1rem"}
                display={"flex"}
                alignItems={"center"}
                flexWrap={"wrap"}
              >
                <Text
                  pb={"0.5rem"}
                  width={{ base: "50%", md: "50%", lg: "40%" }}
                  fontSize={{ base: "14px", md: "17px" }}
                  fontWeight={700}
                >
                  NRC Front
                </Text>
                <Image
                  src={ownerDataForShowDetail.nrc_front}
                  alt="avatar"
                  width={"100%"}
                  height={170}
                  className="object-contain"
                />
              </Box>
              <Box
                py={"1rem"}
                display={"flex"}
                alignItems={"center"}
                flexWrap={"wrap"}
              >
                <Text
                  pb={"0.5rem"}
                  width={{ base: "50%", md: "50%", lg: "40%" }}
                  fontSize={{ base: "14px", md: "17px" }}
                  fontWeight={700}
                >
                  NRC Back
                </Text>
                <Image
                  src={ownerDataForShowDetail.nrc_back}
                  alt="avatar"
                  width={"100%"}
                  height={170}
                  className="object-contain"
                />
              </Box>
              {ownerDataForShowDetail.business_logo && (
                <Box py={"1rem"} display={"flex"} alignItems={"center"}>
                  <Text
                    pb={"0.5rem"}
                    width={{ base: "50%", md: "50%", lg: "40%" }}
                    fontSize={{ base: "14px", md: "17px" }}
                    fontWeight={700}
                  >
                    Business Logo
                  </Text>
                  <Image
                    src={ownerDataForShowDetail.business_logo || ""}
                    alt="business logo"
                    width={100}
                    height={100}
                  />
                </Box>
              )}
              <Box py={"1rem"}>
                <Text mr={"0.4rem"} mb={3} fontWeight={700}>
                  Sport Types{" "}
                </Text>
                {ownerDataForShowDetail.tags.map((item) => {
                  return (
                    <Tag
                      p={4}
                      mr={3}
                      bgColor={"#ccdeff"}
                      key={item.sport_type_id}
                      mb={2}
                    >
                      {item.name}
                    </Tag>
                  );
                })}
              </Box>

              <Box>
                <Text fontSize={"21px"} mb={"2"} fontWeight={700}>
                  Status
                </Text>
                <Select
                  value={value.status}
                  onChange={handleChange}
                  width={{ xl: "50%" }}
                >
                  <option value="0">Pending</option>
                  <option value="1">Approved</option>
                  <option value="2">Blocked</option>
                  <option value="3">Failed</option>
                </Select>
              </Box>
              <Box>
                <Button
                  colorScheme="blue"
                  onClick={saveFun}
                  width={"50%"}
                  isLoading={isBtnLoading}
                  loadingText="Loading"
                  mt={8}
                >
                  Save
                </Button>
              </Box>
            </Box>
            <Box className="showDetail" my={5}>
              <BankingInfo
                kpay_name={ownerDataForShowDetail.kpay_name}
                kpay_no={ownerDataForShowDetail.kpay_no}
                kbz_banking_no={ownerDataForShowDetail.kbz_banking_no}
                wavepay_name={ownerDataForShowDetail.wavepay_name}
                wavepay_no={ownerDataForShowDetail.wavepay_no}
                cb_banking_no={ownerDataForShowDetail.cb_banking_no}
                uab_pay_no={ownerDataForShowDetail.uab_pay_no}
                uab_banking_no={ownerDataForShowDetail.uab_banking_no}
                aya_pay_no={ownerDataForShowDetail.aya_pay_no}
                aya_banking_no={ownerDataForShowDetail.aya_banking_no}
              />
            </Box>
          </Box>
        </Box>
      ) : (
        <Loading />
      )}
    </Box>
  );
};

export default ShowDetailComponent;
