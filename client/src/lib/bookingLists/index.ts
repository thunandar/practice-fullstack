"use client";
import { centralApi } from "../api-central";

export interface GetBookingListsTypes {
  access_token?: string;
  page?: number;
  per_page?: number;
  from: string | null;
  to: string | null;
  exportcsv: boolean;
}

export const getBookingLists = async (crediential: GetBookingListsTypes) => {
  const data = await centralApi("bookingListAPI", "POST", crediential);
  if (data === undefined || data === null) {
    return;
  } else {
    return data;
  }
};
