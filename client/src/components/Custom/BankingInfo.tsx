import { Box, Tag, Text } from "@chakra-ui/react";
import React from "react";

interface BankInfoType {
  kpay_name?: string;
  kpay_no?: string;
  kbz_banking_no?: string;
  wavepay_name?: string;
  wavepay_no?: string;
  cb_banking_no?: string;
  uab_pay_no?: string;
  uab_banking_no?: string;
  aya_pay_no?: string;
  aya_banking_no?: string;
}

const BankingInfo = ({
  kpay_name,
  kpay_no,
  kbz_banking_no,
  wavepay_name,
  wavepay_no,
  cb_banking_no,
  uab_pay_no,
  uab_banking_no,
  aya_pay_no,
  aya_banking_no,
}: BankInfoType) => {
  return (
    <Box>
      <Box bgColor={"#ccdeff"}>
        <Text
          fontSize={{ lg: "22px" }}
          fontWeight={700}
          px={6}
          py={{ base: 4, md: 6 }}
        >
          BankingInfo
        </Text>

        <Box>
          {/* kpay_name */}
          {kpay_name && (
            <Tag width={"100%"} px={6} py={{ base: 4, md: 6 }}>
              <Text
                width={{ base: "50%", xl: "40%" }}
                fontSize={{ base: "14px", md: "17px" }}
                fontWeight={700}
              >
                Kpay Name
              </Text>
              <Text
                width={{ base: "50%", xl: "60%" }}
                fontSize={{ base: "14px", md: "16px" }}
              >
                {kpay_name}
              </Text>
            </Tag>
          )}
          {/* kpay_no */}
          {kpay_no && (
            <Tag width={"100%"} px={6} py={{ base: 4, md: 6 }}>
              <Text
                width={{ base: "50%", xl: "40%" }}
                fontSize={{ base: "14px", md: "17px" }}
                fontWeight={700}
              >
                Kpay No
              </Text>
              <Text
                width={{ base: "50%", xl: "60%" }}
                fontSize={{ base: "14px", md: "16px" }}
              >
                {kpay_no}
              </Text>
            </Tag>
          )}
          {/* kbz_banking_no */}
          {kbz_banking_no && (
            <Tag width={"100%"} px={6} py={{ base: 4, md: 6 }}>
              <Text
                width={{ base: "50%", xl: "40%" }}
                fontSize={{ base: "14px", md: "17px" }}
                fontWeight={700}
              >
                KBZ Banking No
              </Text>
              <Text
                width={{ base: "50%", xl: "60%" }}
                fontSize={{ base: "14px", md: "16px" }}
              >
                {kbz_banking_no}
              </Text>
            </Tag>
          )}
          {/* wavepay_name */}
          {wavepay_name && (
            <Tag width={"100%"} px={6} py={{ base: 4, md: 6 }}>
              <Text
                width={{ base: "50%", xl: "40%" }}
                fontSize={{ base: "14px", md: "17px" }}
                fontWeight={700}
              >
                Wave Pay Name
              </Text>
              <Text
                width={{ base: "50%", xl: "60%" }}
                fontSize={{ base: "14px", md: "16px" }}
              >
                {wavepay_name}
              </Text>
            </Tag>
          )}
          {/* wavepay_no */}
          {wavepay_no && (
            <Tag width={"100%"} px={6} py={{ base: 4, md: 6 }}>
              <Text
                width={{ base: "50%", xl: "40%" }}
                fontSize={{ base: "14px", md: "17px" }}
                fontWeight={700}
              >
                Wave Pay No
              </Text>
              <Text
                width={{ base: "50%", xl: "60%" }}
                fontSize={{ base: "14px", md: "16px" }}
              >
                {wavepay_no}
              </Text>
            </Tag>
          )}
          {/* cb_banking_no */}
          {cb_banking_no && (
            <Tag width={"100%"} px={6} py={{ base: 4, md: 6 }}>
              <Text
                width={{ base: "50%", xl: "40%" }}
                fontSize={{ base: "14px", md: "17px" }}
                fontWeight={700}
              >
                CB Banking No
              </Text>
              <Text
                width={{ base: "50%", xl: "60%" }}
                fontSize={{ base: "14px", md: "16px" }}
              >
                {cb_banking_no}
              </Text>
            </Tag>
          )}
          {/* uab_pay_no */}
          {uab_pay_no && (
            <Tag width={"100%"} px={6} py={{ base: 4, md: 6 }}>
              <Text
                width={{ base: "50%", xl: "40%" }}
                fontSize={{ base: "14px", md: "17px" }}
                fontWeight={700}
              >
                UAB Pay No
              </Text>
              <Text
                width={{ base: "50%", xl: "60%" }}
                fontSize={{ base: "14px", md: "16px" }}
              >
                {uab_pay_no}
              </Text>
            </Tag>
          )}
          {/* uab_banking_no */}
          {uab_banking_no && (
            <Tag width={"100%"} px={6} py={{ base: 4, md: 6 }}>
              <Text
                width={{ base: "50%", xl: "40%" }}
                fontSize={{ base: "14px", md: "17px" }}
                fontWeight={700}
              >
                UAB Banking No
              </Text>
              <Text
                width={{ base: "50%", xl: "60%" }}
                fontSize={{ base: "14px", md: "16px" }}
              >
                {uab_banking_no}
              </Text>
            </Tag>
          )}
          {/* aya_pay_no */}
          {aya_pay_no && (
            <Tag width={"100%"} px={6} py={{ base: 4, md: 6 }}>
              <Text
                width={{ base: "50%", xl: "40%" }}
                fontSize={{ base: "14px", md: "17px" }}
                fontWeight={700}
              >
                AYA Pay No
              </Text>
              <Text
                width={{ base: "50%", xl: "60%" }}
                fontSize={{ base: "14px", md: "16px" }}
              >
                {aya_pay_no}
              </Text>
            </Tag>
          )}
          {/* aya_banking_no */}
          {aya_banking_no && (
            <Tag width={"100%"} px={6} py={{ base: 4, md: 6 }}>
              <Text
                width={{ base: "50%", xl: "40%" }}
                fontSize={{ base: "14px", md: "17px" }}
                fontWeight={700}
              >
                AYA Banking No
              </Text>
              <Text
                width={{ base: "50%", xl: "60%" }}
                fontSize={{ base: "14px", md: "16px" }}
              >
                {aya_banking_no}
              </Text>
            </Tag>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default BankingInfo;
