import { UpdatePricing } from "@/src/lib/pricing";
import { PricingDataType } from "@/src/types/pricing";
import { validatePricingForm } from "@/src/validation/pricingValidat";
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
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { forwardRef, useImperativeHandle, useState } from "react";

interface EditModalProps {
  title: string;
}

export interface EditModalRef {
  open: (data: PricingDataType) => void;
  close: () => void;
}

const EditModal: React.ForwardRefRenderFunction<
  EditModalRef,
  EditModalProps
> = ({ title }, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState<PricingDataType>({
    name: "",
    price: {
      monthly: 0,
      quarterly: 0,
      halfYearly: 0,
      yearly: 0,
    },
    court_limit: 1,
    push_notification_limit: 0,
    marketing_post_limit: 0,
    order: 1,
  });

  const toast = useToast();
  const [errors, setErrors] = useState<Partial<PricingDataType>>({});
  const { monthly, yearly, halfYearly, quarterly } = formData.price;
  const isDisabled =
    monthly > 0 || yearly > 0 || halfYearly > 0 || quarterly > 0;

  useImperativeHandle(ref, () => ({
    open: (data: PricingDataType) => {
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
    const { name, value } = e.target;
    if (
      name === "monthly" ||
      name === "quarterly" ||
      name === "halfYearly" ||
      name === "yearly"
    ) {
      setFormData((prevData) => ({
        ...prevData,
        price: {
          ...prevData.price,
          [name]: parseFloat(value),
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Partial<PricingDataType> = validatePricingForm(formData);

    if (Object.keys(newErrors).length === 0) {
      const res = await UpdatePricing(formData);
      if (res === undefined) {
        return;
      }
      if (res.status === 1) {
        toastFun("Error", res.message || res.errors.message, "error");
      } else if (res.status === 0) {
        toastFun("Success", res.message, "success");
        onClose();
        window.location.reload();
      }
    } else {
      setErrors(newErrors);
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, marginRight: "10px" }}>
                <FormControl isInvalid={!!errors.name}>
                  <FormLabel>Name</FormLabel>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <Text color="red">{errors.name}</Text>

                <FormControl isRequired>
                  <FormLabel>Monthly Price</FormLabel>
                  <Input
                    type="number"
                    name="monthly"
                    value={formData.price.monthly}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Quarterly Price</FormLabel>
                  <Input
                    type="number"
                    name="quarterly"
                    value={formData.price.quarterly}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <FormControl isInvalid={!!errors.court_limit}>
                  <FormLabel>Court Limit</FormLabel>
                  <Input
                    type="number"
                    name="court_limit"
                    value={formData.court_limit}
                    onChange={handleInputChange}
                    min={1}
                  />
                </FormControl>
                <Text color="red">{errors.court_limit}</Text>

                <FormControl>
                  <FormLabel>Order</FormLabel>
                  <Input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    min={1}
                  />
                </FormControl>
              </div>
              <div style={{ flex: 1 }}>
                <FormControl>
                  <FormLabel>Half-Yearly Price</FormLabel>
                  <Input
                    type="number"
                    name="halfYearly"
                    value={formData.price.halfYearly}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Yearly Price</FormLabel>
                  <Input
                    type="number"
                    name="yearly"
                    value={formData.price.yearly}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl isInvalid={!!errors.push_notification_limit}>
                  <FormLabel>Notification Limit</FormLabel>
                  <Input
                    type="number"
                    name="push_notification_limit"
                    value={formData.push_notification_limit}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <Text color="red">{errors.push_notification_limit}</Text>

                <FormControl isInvalid={!!errors.marketing_post_limit}>
                  <FormLabel>Marketing Post Limit</FormLabel>
                  <Input
                    type="number"
                    name="marketing_post_limit"
                    value={formData.marketing_post_limit}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <Text color="red">{errors.marketing_post_limit}</Text>
              </div>
            </div>
            <Button
              type="submit"
              colorScheme="blue"
              mt={4}
              isDisabled={isDisabled ? false : true}
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
