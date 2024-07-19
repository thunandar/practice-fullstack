import { getCookie } from "cookies-next";

export const getAccessToken = () => {
  if (typeof window !== "undefined") {
    const accesToken = getCookie("access_token");
    return accesToken as string;
  }
};
