import { forwardRef, useImperativeHandle, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  useDisclosure,
  useToast,
  Box,
  Text,
  Divider,
} from "@chakra-ui/react";
import { BookingListsReturnDataType } from "@/src/types/bookingLists";

interface DetailsModalProps {
  title: string; // Data to be edited
}

export interface DetailsModalRef {
  open: (data: BookingListsReturnDataType) => void; // Updated to accept data object
  close: () => void;
}

const BookingListsDetailsModal: React.ForwardRefRenderFunction<
  DetailsModalRef,
  DetailsModalProps
> = ({ title }, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState<BookingListsReturnDataType>({
    court: { name: "", phone: "", court_id: "" },
    booking_time: [],
    owner: {
      name: "",
      phone: "",
      email: "",
      owner_id: "",
      id: null,
    },
    booking_date: "",
    user: {
      name: "",
      phone: "",
      email: "",
      user_id: "",
    },
    status: 0,
    is_manual: true,
    createdAt: "",
    employee: null,
    discount_amount: "",
    total_amount: "",
    id: "",
    data_id: "",
  });
  const toast = useToast();

  useImperativeHandle(ref, () => ({
    open: (data: BookingListsReturnDataType) => {
      onOpen();
      setFormData(data);
    },
    close: onClose,
  }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  // Render modal content
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>
            {/* user */}
            <Box mb={4}>
              <Text
                fontWeight={"bold"}
                fontSize={20}
                mb={4}
              >
                User
              </Text>
              <Box>
                <Box display={"flex"} my={2}>
                  <Text fontWeight={"bold"} width={"40%"}>
                    Name
                  </Text>
                  <Text width={"60%"}>{formData.user.name}</Text>
                </Box>
                <Box display={"flex"} my={2}>
                  <Text fontWeight={"bold"} width={"40%"}>
                    Email
                  </Text>
                  <Text width={"60%"}>{formData.user.email}</Text>
                </Box>
                <Box display={"flex"} my={2}>
                  <Text fontWeight={"bold"} width={"40%"}>
                    Phone
                  </Text>
                  <Text width={"60%"}>{formData.user.phone}</Text>
                </Box>
              </Box>
            </Box>
            <Divider borderBottom={"1px"} />

            <Box display={"flex"} mt={4} mb={2}>
              <Text fontWeight={"bold"} width={"40%"}>
                Booking Date
              </Text>
              <Text width={"60%"}>{formData.booking_date}</Text>
            </Box>
            <Box display={"flex"} mt={2} mb={4}>
              <Text fontWeight={"bold"} width={"40%"}>
                Booking Time
              </Text>
              <Text width={"60%"}>{formData.booking_time.join(" / ")}</Text>
            </Box>
            <Divider borderBottom={"1px"} />

            <Box my={4}>
              <Text
                fontWeight={"bold"}
                fontSize={20}
                mb={4}
              >
                Court
              </Text>
              <Box>
                <Box display={"flex"} my={2}>
                  <Text fontWeight={"bold"} width={"40%"}>
                    Name
                  </Text>
                  <Text width={"60%"}>{formData.court.name}</Text>
                </Box>
                <Box display={"flex"} my={2}>
                  <Text fontWeight={"bold"} width={"40%"}>
                    Phone
                  </Text>
                  <Text width={"60%"}>{formData.court.phone}</Text>
                </Box>
              </Box>
            </Box>
            <Divider borderBottom={"1px"} />

            <Box my={4}>
              <Text
                fontWeight={"bold"}
                fontSize={20}
                mb={4}
              >
                Owner
              </Text>
              <Box>
                <Box my={2} display={"flex"}>
                  <Text fontWeight={"bold"} width={"40%"}>
                    Name
                  </Text>
                  <Text width={"60%"}>{formData.owner?.name}</Text>
                </Box>
                <Box my={2} display={"flex"}>
                  <Text fontWeight={"bold"} width={"40%"}>
                    Email
                  </Text>
                  <Text width={"60%"}>{formData.owner?.email}</Text>
                </Box>
                <Box my={2} display={"flex"}>
                  <Text fontWeight={"bold"} width={"40%"}>
                    Phone
                  </Text>
                  <Text width={"60%"}>{formData.owner?.phone}</Text>
                </Box>
              </Box>
            </Box>
            <Divider borderBottom={"1px"} />
            <Box display={"flex"} mt={4} mb={2}>
              <Text fontWeight={"bold"} width={"40%"}>
                Total Price
              </Text>
              <Text width={"60%"}>{formData.total_amount}</Text>
            </Box>
            <Box display={"flex"} my={2}>
              <Text fontWeight={"bold"} width={"40%"}>
                Discount Price
              </Text>
              <Text width={"60%"}>{formData.discount_amount}</Text>
            </Box>
            <Box display={"flex"} my={2}>
              <Text fontWeight={"bold"} width={"40%"}>
                Data Id
              </Text>
              <Text width={"60%"}>{formData.data_id}</Text>
            </Box>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default forwardRef(BookingListsDetailsModal);
