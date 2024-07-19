import { CookieValueTypes } from "cookies-next";

export type SportTypesData = {
  id?: number | string;
  name?: string;
  icon?: string;
  createdAt?: string;
};

export type SportTypesFormData = {
  name: string;
  icon: string;
};

export type CreateSportTypesData = {
  name?: string;
  icon?: string;
  id?: number | string;
};

export interface SportTypesList {
  page: number;
  per_page: number;
  access_token?: CookieValueTypes;
  id?: string;
}
