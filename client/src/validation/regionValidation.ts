import { RegionDataType } from "../types/region";

export const validateRegionForm = (formData: Partial<RegionDataType>) => {
  const newErrors: Partial<RegionDataType> = {};

  if (!formData.name) {
    newErrors.name = "Region name is required";
  }
  return newErrors;
};
