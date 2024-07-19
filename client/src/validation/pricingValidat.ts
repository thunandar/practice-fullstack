import { PricingDataType } from "../types/pricing";

export const validatePricingForm = (formData: Partial<PricingDataType>) => {
  const newErrors: any = {};
  if (!formData.name) {
    newErrors.name = "Pricing name is required";
  }

  if (!formData.court_limit) {
    newErrors.court_limit = "Court is required";
  } else if (formData.court_limit <= 0) {
    newErrors.court_limit = "Court must be greater than 0";
  }

  if (!formData.marketing_post_limit) {
    newErrors.marketing_post_limit = "Marketing post limit is required";
  } else if (formData.marketing_post_limit <= 0) {
    newErrors.marketing_post_limit =
      "Marketing post limit must be greater than 0";
  }

  if (!formData.push_notification_limit) {
    newErrors.push_notification_limit = "Notification limit is required";
  } else if (formData.push_notification_limit <= 0) {
    newErrors.push_notification_limit = "Notification  must be greater than 0";
  }

  return newErrors;
};
