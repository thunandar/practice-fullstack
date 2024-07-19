import { CookieValueTypes } from "cookies-next";

export type ContactMessageData = {
  owner?: {
    name: string;
    phone: string;
    email: string;
    owner_id: string | number;
  };
  employee?: {
    name: string;
    phone: string;
    email: string;
    employee_id: string | number;
  };
  user?: {
    name: string;
    phone: string;
    email: string;
    user_id: string | number;
  };
  message?: string;
  type?: string;
  createdAt?: string;
  id?: string | number;
};

export type GetMessageList = {
  page: number;
  per_page: number | string;
  access_token: CookieValueTypes;
};
