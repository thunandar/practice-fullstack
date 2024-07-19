"use cleint";
import { CookieValueTypes, setCookie } from "cookies-next";
import { centralApi } from "../api-central";
import { saveAuth } from "../auth";
import { AdminDataType } from "@/src/types/admin";
interface AdminLogin {
  email: string;
  password: string;
}
export const AdminLogin = async (crediential: AdminLogin) => {
  const data = await centralApi("adminLoginAPI", "POST", crediential);
  if (data === undefined || data === null) {
    return;
  } else if (data.status === 1) {
    if (typeof window !== "undefined") {
      return data;
    }
  } else {
    if (typeof window !== "undefined") {
      saveAuth(data);

      // setCookie("access_token", data.access_token);
      return data;
    }
  }
};

export interface AdminList {
  page: number;
  per_page: number;
  access_token?: CookieValueTypes;
}

export const GetAdminList = async (crediential: AdminList) => {
  const data = await centralApi("adminListAPI", "POST", crediential);
  if (data === undefined || data === null) {
    return;
  } else {
    return data;
  }
};

export const CreateAdmin = async (crediential: AdminDataType) => {
  const data = await centralApi("adminCreateAPI", "POST", crediential);
  if (data === undefined || data === null) {
    return;
  } else {
    return data;
  }
};

export const UpdateAdmin = async (crediential: AdminDataType) => {
  const data = await centralApi("adminUpdateAPI", "POST", crediential);
  if (data === undefined || data === null) {
    return;
  } else {
    return data;
  }
};

interface AdminDeleteType {
  id?: number;
  access_token?: string;
}

export const DeleteAdmin = async (crediential: AdminDeleteType) => {
  const data = await centralApi("adminDeleteAPI", "POST", crediential);
};
