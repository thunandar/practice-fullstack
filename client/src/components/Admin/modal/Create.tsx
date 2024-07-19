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
  Select,
  useToast,
} from "@chakra-ui/react";
import { CreateAdmin } from "@/src/lib/admin";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setCreateLoading } from "@/src/store/slices/globalSlice";
import { addAdmin } from "@/src/store/slices/adminSlice";

interface MyModalProps {
  title: string;
  children?: React.ReactNode;
}

export interface MyModalRef {
  open: () => void;
  close: () => void;
}

export enum AdminRoleEnum {
  Admin = 0,
  Moderator = 1,
}

export interface AdminFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: AdminRoleEnum;
}

const CreateModal: React.ForwardRefRenderFunction<MyModalRef, MyModalProps> = (
  { title, children },
  ref
) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState<AdminFormData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: AdminRoleEnum.Admin, // Default role is Admin
  });
  const isCreateLoading = useAppSelector((state) => state.global.createLoading);
  const toast = useToast();
  const dispatch = useAppDispatch();

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

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      role: parseInt(e.target.value, 10) as AdminRoleEnum,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    dispatch(setCreateLoading(true));
    const res = await CreateAdmin(formData);

    if (res === undefined) {
      return;
    }
    if (res.status === 1) {
      toastFun("Error", res.message || res.errors.message, "error");
    } else if (res.status === 0) {
      toastFun("Success", res.message, "success");
      dispatch(addAdmin(res.admin));
    }
    dispatch(setCreateLoading(false));
    onClose();
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      role: AdminRoleEnum.Admin,
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
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Email</FormLabel>
              <Input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Role</FormLabel>
              <Select
                required
                value={formData.role}
                onChange={(e) => handleRoleChange(e)}
              >
                <option value={AdminRoleEnum.Admin}>Admin</option>
                <option value={AdminRoleEnum.Moderator}>Moderator</option>
              </Select>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Phone</FormLabel>
              <Input
                required
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Password</FormLabel>
              <Input
                required
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </FormControl>
            <Button
              isLoading={isCreateLoading}
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

export default forwardRef(CreateModal);
