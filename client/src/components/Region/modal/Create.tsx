import {
  ForwardRefRenderFunction,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
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
import { CreateRegion } from "@/src/lib/region";
import { useDispatch } from "react-redux";
import { setCreateLoading } from "@/src/store/slices/globalSlice";
import { useAppSelector } from "@/src/store/hooks";
import { RegionDataType } from "@/src/types/region";

interface MyModalProps {
  title: string;
  children?: React.ReactNode;
  fetchData: () => void;
}

export interface MyModalRef {
  open: () => void;
  close: () => void;
}

const CreateModal: ForwardRefRenderFunction<MyModalRef, MyModalProps> = (
  { title, children, fetchData },
  ref
) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { createLoading } = useAppSelector((state) => state.global);
  const [formData, setFormData] = useState<RegionDataType>({
    name: "",
  });
  const toast = useToast();
  const dispatch = useDispatch();

  useImperativeHandle(ref, () => ({
    open: onOpen,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setCreateLoading(true));
    const res = await CreateRegion(formData);

    if (res === undefined) {
      return;
    }

    if (res.status === 1) {
      toastFun("Error", res.message || res.errors.message, "error");
    } else if (res.status === 0) {
      toastFun("Success", res.message, "success");
    }
    onClose();
    dispatch(setCreateLoading(false));
    fetchData();
    setFormData({
      name: "",
    });
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
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </FormControl>
            <Button
              isLoading={createLoading}
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

export default forwardRef(CreateModal);
