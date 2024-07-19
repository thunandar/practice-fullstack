"use client";

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
import { getBase64 } from "@/src/utils";
import { CreateBanner } from "@/src/lib/banner";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setCreateLoading } from "@/src/store/slices/globalSlice";

interface MyModalProps {
  title: string;
  children?: React.ReactNode;
  fetchData: () => void;
}

export interface MyModalRef {
  open: () => void;
  close: () => void;
}

export interface BannerFormData {
  title: string;
  body: string;
  url: string;
  web_image?: string;
  mobile_image?: string;
}

const CreateModal: ForwardRefRenderFunction<MyModalRef, MyModalProps> = (
  { title, fetchData },
  ref
) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState<BannerFormData>({
    title: "",
    body: "",
    url: "",
    mobile_image: "",
    web_image: "",
  });
  const { createLoading } = useAppSelector((state) => state.global);
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        getBase64(e.target.files[0], (result: any) => {
          setFormData((prevData) => ({
            ...prevData,
            [e.target.name]: result,
          }));
        });
      } catch (error) {
        toastFun("Error", "Base64 converting error", "error");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setCreateLoading(true));
    try {
      const res = await CreateBanner(formData);

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
      fetchData();
      setFormData({
        title: "",
        body: "",
        url: "",
        mobile_image: "",
        web_image: "",
      });
    } catch (error) {
      toastFun("Error", "Error submitting the form", "error");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent minW={{ base: "100%", sm: "90%", md: "40%", lg: "28%" }}>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={(e) => handleSubmit(e)}>
            <FormControl marginBottom={5}>
              <FormLabel>Title</FormLabel>
              <Input
                type="text"
                name="title"
                value={formData.title}
                placeholder="title"
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl marginBottom={5}>
              <FormLabel>Body</FormLabel>
              <Input
                type="text"
                name="body"
                value={formData.body}
                placeholder="body"
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl marginBottom={5}>
              <FormLabel>Url</FormLabel>
              <Input
                type="text"
                name="url"
                value={formData.url}
                placeholder="localhost:4000"
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl marginBottom={5}>
              <FormLabel>Mobile Image</FormLabel>
              <Input
                type="file"
                name="mobile_image"
                onChange={handleImageChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Web Image</FormLabel>
              <Input
                type="file"
                name="web_image"
                onChange={handleImageChange}
              />
            </FormControl>
            <Button
              isLoading={createLoading}
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
