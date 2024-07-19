import { CookieValueTypes } from "cookies-next";
import { centralApi } from "../api-central";

export interface UserList {
  page: number;
  per_page: number;
  access_token?: CookieValueTypes;
  value?: string;
}

export const GetUserList = async (crediential: UserList) => {
  const data = await centralApi("userListAPI", "POST", crediential);
  if (data === undefined || data === null) {
    return;
  } else {
    return data;
  }
};

export const SearchUserList = async (credential: UserList) => {
  const data = await centralApi("userSearchAPI", "POST", credential);

  if (data === undefined || data === null) {
    return;
  } else {
    return data;
  }
};
