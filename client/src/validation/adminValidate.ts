import { AdminFormData } from "../components/Admin/modal/Create";

export const validateForm = (formData: Partial<AdminFormData>) => {
  const newErrors: Partial<AdminFormData> = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}/;

  if (!formData.name) {
    newErrors.name = "Name is required";
  } else if (formData.name.length < 3 || formData.name.length > 20) {
    newErrors.name = "Name must be between 3 and 20 characters";
  }

  if (!formData.email) {
    newErrors.email = "Email is required";
  } else if (!emailRegex.test(formData.email)) {
    newErrors.email = "Invalid email address";
  }

  if (!formData.phone) {
    newErrors.phone = "Phone Number is required";
  } else if (formData.phone.length < 5 || formData.phone.length > 13) {
    newErrors.phone = "Phone Number must be between 5 and 13 characters";
  }

  if (!formData.password) {
    newErrors.password = "Password is required";
  } else if (
    !passwordRegex.test(formData.password) ||
    formData.password.length < 6 ||
    formData.password.length > 20
  ) {
    newErrors.password =
      "Password must contain at least one lowercase letter, one digit, and one special character and must be between 6 and 20 characters";
  }

  return newErrors;
};
