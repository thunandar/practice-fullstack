import { validateForm } from "@/src/validation/adminValidate";
import {
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
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { forwardRef, useImperativeHandle, useState } from "react";
import { AdminFormData } from "./Create";
import { UpdateAdmin } from "@/src/lib/admin"; // Assuming there's an UpdateAdmin function for editing
import { AdminRoleEnum } from "./Create";
import { AdminDataType } from "@/src/types/admin";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setEditLoading } from "@/src/store/slices/globalSlice";
import { updateAdmin } from "@/src/store/slices/adminSlice";

interface EditModalProps {
  title: string; // Data to be edited
}

export interface EditModalRef {
  open: (data: AdminDataType) => void; // Updated to accept data object
  close: () => void;
}

const EditModal: React.ForwardRefRenderFunction<
  EditModalRef,
  EditModalProps
> = ({ title }, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState<AdminDataType>({
    name: "",
    email: "",
    phone: "",
    role: AdminRoleEnum.Admin,
  });
  const [errors, setErrors] = useState<Partial<AdminFormData>>({});

  const toast = useToast();
  const { editLoading } = useAppSelector((state) => state.global);
  const dispatch = useAppDispatch();

  useImperativeHandle(ref, () => ({
    open: (data: AdminDataType) => {
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

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      role: parseInt(e.target.value, 10) as AdminRoleEnum,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(setEditLoading(true));
    const res = await UpdateAdmin(formData);
    if (res === undefined) {
      return;
    }
    if (res.status === 1) {
      toastFun("Error", res.message || res.errors.message, "error");
    } else if (res.status === 0) {
      toastFun("Success", res.message, "success");
      dispatch(updateAdmin(res.admin));
    }
    dispatch(setEditLoading(false));
    onClose();
  };

  // Render modal content
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={(e) => handleSubmit(e)}>
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>Name</FormLabel>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </FormControl>
            <Text color="red">{errors.name}</Text>

            <FormControl mt={4} isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </FormControl>
            <Text color="red">{errors.email}</Text>

            <FormControl mt={4}>
              <FormLabel>Role</FormLabel>
              <Select
                value={formData.role}
                onChange={(e) => handleRoleChange(e)}
              >
                <option value={AdminRoleEnum.Admin}>Admin</option>
                <option value={AdminRoleEnum.Moderator}>Moderator</option>
              </Select>
            </FormControl>
            <FormControl mt={4} isInvalid={!!errors.phone}>
              <FormLabel>Phone</FormLabel>
              <Input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
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
