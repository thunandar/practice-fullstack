import { CreateTownship } from "@/src/lib/township";
import { useAppSelector } from "@/src/store/hooks";
import { setCreateLoading, setPerPage } from "@/src/store/slices/globalSlice";
import { TownshipDataType } from "@/src/types/township";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  useDisclosure,
  useToast,
  Text,
  Image,
} from "@chakra-ui/react";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useDispatch } from "react-redux";
import Loading from "../../Custom/Loading";

interface TownshipCreateModalProps {
  title: string;
  children?: React.ReactNode;
  fetchData: () => void;
}

export interface TownshipCreateModalRef {
  open: () => void;
  close: () => void;
}

const TownshipCreateModal: React.ForwardRefRenderFunction<
  TownshipCreateModalRef,
  TownshipCreateModalProps
> = ({ title, children, fetchData }, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState<TownshipDataType>({
    name: "",
    region_id: "",
  });
  const dispatch = useDispatch();
  const { createLoading, isFetchLoading } = useAppSelector(
    (state) => state.global
  );
  const regionList = useAppSelector((state) => state.region.regionData);
  let perPage = useAppSelector((state) => state.global.credential.per_page);

  useImperativeHandle(ref, () => ({
    open: onOpen,
    close: onClose,
  }));

  const toast = useToast();
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    dispatch(setCreateLoading(true));
    const res = await CreateTownship(formData);
    if (res === undefined) {
      return;
    }

    if (res.status === 1) {
      toastFun("Error", res.message || res.errors.message, "error");
    } else if (res.status === 0) {
      toastFun("Success", res.message, "success");
    }
    dispatch(setCreateLoading(false));
    onClose();
    setFormData({
      name: "",
      region_id: "",
    });
    fetchData();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleIsUserIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      region_id: e.target.value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent minW={{ base: "100%", sm: "90%", md: "40%", lg: "28%" }}>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={(e) => handleSubmit(e)}>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Region</FormLabel>
              {regionList?.length > 0 ? (
                <Box display={"flex"}>
                  <Select
                    required
                    placeholder="Select Region"
                    value={formData.region_id}
                    onChange={(e) => handleIsUserIdChange(e)}
                  >
                    {regionList.map((item) => {
                      return (
                        <option value={item.id} key={item.id}>
                          {item.name}
                        </option>
                      );
                    })}
                  </Select>
                  <Text
                    color={"#185aca"}
                    cursor={"pointer"}
                    width={"35%"}
                    textAlign={"center"}
                    my={"auto"}
                    onClick={() => {
                      dispatch(setPerPage((perPage += 10)));
                    }}
                  >
                    Load more
                  </Text>
                </Box>
              ) : (
                <Loading />
              )}
            </FormControl>

            <Button
              isLoading={createLoading}
              float="inline-end"
              type="submit"
              colorScheme="blue"
              mt={4}
              sx={{
                bgColor: "#5c90e9",
                transitionDuration: "500ms",
                color: "white",
                _hover: {
                  bgColor: "#185aca",
                },
                mb: 3,
              }}
            >
              Create
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default forwardRef(TownshipCreateModal);
