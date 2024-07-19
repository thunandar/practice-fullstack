"use client";
import { centralApi } from "../api-central";

export interface GetOwnerDataTypes {
  access_token?: string;
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
}

export interface OwnerUpdateStatus {
  access_token?: string;
  id?: number;
  status: number;
}

export interface OwnerDeleteType {
  access_token?: string;
  id: number;
}

export async function GetOwnerData(crediential: GetOwnerDataTypes) {
  const data = await centralApi("ownerList", "POST", crediential);
  if (data === undefined || data === null) {
    return;
  } else {
    return data;
  }
}

export const ownerUpdateStatus = async (crediential: OwnerUpdateStatus) => {
  const data = await centralApi("ownerUpdateStatus", "POST", crediential);
  if (data === undefined || data === null) {
    return;
  } else {
    return data;
  }
};

export const ownerDelete = async (crediential: OwnerDeleteType) => {
  const data = await centralApi("ownerDelete", "POST", crediential);
  if (data === undefined || data === null) {
    return;
  } else {
    return data;
  }
};
