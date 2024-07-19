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
  FormControl,
  FormLabel,
  Input,
  useToast,
} from "@chakra-ui/react";

import { SportTypesData } from "@/src/types/sportType";
import { UpdateSportType } from "@/src/lib/sportTypes";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setEditLoading } from "@/src/store/slices/globalSlice";

interface EditModalProps {
  title: string;
  fetchData: () => void;
}

export interface EditModalRef {
  open: (data: SportTypesData) => void;
  close: () => void;
}

const EditModal: React.ForwardRefRenderFunction<
  EditModalRef,
  EditModalProps
> = ({ title, fetchData }, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState<SportTypesData>({
    id: "",
    name: "",
    icon: "",
  });
  const { editLoading } = useAppSelector((state) => state.global);

  const toast = useToast();
  const dispatch = useAppDispatch();

  useImperativeHandle(ref, () => ({
    open: (data: SportTypesData) => {
      onOpen();
      setFormData(data);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(setEditLoading(true));
    const res = await UpdateSportType(formData);
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
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent minW={{ base: "100%", sm: "90%", md: "40%", lg: "28%" }}>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={(e) => handleSubmit(e)}>
            <FormControl marginBottom={10}>
              <FormLabel>Name</FormLabel>
              <Input
                type="text"
                name="name"
                value={formData.name}
                placeholder="sport name"
                onChange={handleInputChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Icon</FormLabel>
              <Input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                placeholder="fas fa-futbol"
              />
            </FormControl>
            <Button
              isLoading={editLoading}
              float="inline-end"
              type="submit"
              colorScheme="blue"
              mt={4}
            >
              Submit
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default forwardRef(EditModal);
