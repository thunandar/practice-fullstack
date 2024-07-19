import { OwnerDataType } from "../types/owner";

export const statusMappings: Record<number, string> = {
  0: "Pending",
  1: "Approved",
  2: "Blocked",
  3: "Failed",
};

export const changeStatus = (resultdata: OwnerDataType[]) => {
  return resultdata?.map((item: OwnerDataType) => ({
    ...item,
    status: statusMappings[Number(item.status)],
  }));
};

export const badgeColorChange = (value: string | number) => {
  if (value === "Pending") return "grey";
  if (value === "Approved") return "green";
  if (value === "Blocked") return "purple";
  if (value === "Failed") return "red";
};

export const formattedDate = (date: Date | null): string => {
  if (!date) return ""; // Return empty string if date is null
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
};
