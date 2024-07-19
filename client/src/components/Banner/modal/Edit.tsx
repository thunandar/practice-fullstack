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
import { forwardRef, useImperativeHandle, useState } from "react";
import Image from "next/image";

import { getBase64 } from "@/src/utils";
import { BannerData } from "@/src/types/banner";
import { UpdateBanner } from "@/src/lib/banner";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setEditLoading } from "@/src/store/slices/globalSlice";

interface EditModalProps {
  title: string;
  fetchData: () => void;
}

export interface EditModalRef {
  open: (data: BannerData) => void;
  close: () => void;
}

const EditModal: React.ForwardRefRenderFunction<
  EditModalRef,
  EditModalProps
> = ({ title, fetchData }, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState<BannerData>({
    title: "",
    body: "",
    url: "",
    mobile_image: "",
    web_image: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { editLoading } = useAppSelector((state) => state.global);
  const toast = useToast();
  const dispatch = useAppDispatch();

  useImperativeHandle(ref, () => ({
    open: (data: BannerData) => {
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        getBase64(e.target.files[0], (result: any) => {
          setFormData((prevData) => ({
            ...prevData,
            [e.target.name]: result,
          }));
          setImagePreview(result);
        });
      } catch (error) {
        toastFun("Error", "Base64 converting error", "error");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(setEditLoading(true));
    const res = await UpdateBanner(formData);
    if (res === undefined) {
      return;
    }
    if (res.status === 1) {
      toastFun("Error", res.message || res.errors.message, "error");
    } else if (res.status === 0) {
      toastFun("Success", res.message, "success");
      setImagePreview(null);
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
            <FormControl marginBottom={5}>
              <FormLabel>Title</FormLabel>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl marginBottom={5}>
              <FormLabel>Body</FormLabel>
              <Input
                type="text"
                name="body"
                value={formData.body}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl marginBottom={5}>
              <FormLabel>Url</FormLabel>
              <Input
                type="text"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
              />
            </FormControl>
            {formData.web_image && (
              <Image
                src={formData.web_image}
                alt="image"
                width={0}
                height={0}
                style={{ width: "100%", height: "auto" }}
              />
            )}

            <FormControl marginBottom={5}>
              <FormLabel>Mobile Image</FormLabel>
              <Input
                type="file"
                accept="image/*"
                name="mobile_image"
                onChange={handleImageChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Web Image</FormLabel>
              <Input
                type="file"
                accept="image/*"
                name="web_image"
                onChange={handleImageChange}
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
