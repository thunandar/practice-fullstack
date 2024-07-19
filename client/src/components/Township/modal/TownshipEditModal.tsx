import { forwardRef, useImperativeHandle, useState } from "react";
import { Image } from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Box,
  Text,
} from "@chakra-ui/react";
import { TownshipDataType } from "@/src/types/township";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/src/store/hooks";
import Loading from "../../Custom/Loading";
import { setEditLoading, setPerPage } from "@/src/store/slices/globalSlice";
import { UpdateTownship } from "@/src/lib/township";

interface TownshipEditModalProps {
  title: string; // Data to be edited
  fetchData: () => void;
}

export interface TownshipEditModalRef {
  open: (data: TownshipDataType) => void; // Updated to accept data object
  close: () => void;
}

const TownshipEditModal: React.ForwardRefRenderFunction<
  TownshipEditModalRef,
  TownshipEditModalProps
> = ({ title, fetchData }, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState<TownshipDataType>({
    id: 0,
    name: "",
    region_id: "",
  });
  const dispatch = useDispatch();
  const { editLoading, isFetchLoading } = useAppSelector(
    (state) => state.global
  );
  const regionList = useAppSelector((state) => state.region.regionData);
  let perPage = useAppSelector((state) => state.global.credential.per_page);
  const toast = useToast();

  useImperativeHandle(ref, () => ({
    open: (data: TownshipDataType) => {
      onOpen();
      const newObj = {
        ...data,
        region_id: data.region?.region_id,
      };
      delete newObj?.region;
      setFormData(newObj);
    },
    close: onClose,
  }));

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleIsRegionIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      region_id: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(setEditLoading(true));
    const res = await UpdateTownship(formData);
    if (res === undefined) {
      return;
    }

    if (res.status === 1) {
      toastFun("Error", res.message || res.errors.message, "error");
    } else if (res.status === 0) {
      toastFun("Success", res.message, "success");
    }
    dispatch(setEditLoading(false));
    onClose();
    fetchData();
  };

  // Render modal content
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent minW={{ base: "100%", sm: "90%", md: "40%", lg: "28%" }}>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={(e) => handleSubmit(e)}>
            <Box>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>Staff</FormLabel>
                {regionList.length > 0 ? (
                  <Box display={"flex"}>
                    <Select
                      value={formData.region_id}
                      onChange={(e) => handleIsRegionIdChange(e)}
                      isRequired
                      isDisabled={isFetchLoading}
                      required
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
                      fontSize={{ base: "13px", md: "15px" }}
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
            </Box>

            <Button
              isLoading={editLoading}
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
              Submit
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default forwardRef(TownshipEditModal);
