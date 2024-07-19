import { SportTypesFormData } from "../types/sportType";
export const validateSportForm = (formData: Partial<SportTypesFormData>) => {
  const newErrors: Partial<SportTypesFormData> = {};

  if (!formData.name) {
    newErrors.name = "Sport name is required";
  }
  if (!formData.icon) {
    newErrors.icon = "Icon is required";
  }
  return newErrors;
};
