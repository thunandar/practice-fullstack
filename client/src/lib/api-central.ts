import { api as API } from "@/constant/endpoint";
import { deleteCookie, getCookie } from "cookies-next";
import { getToken } from "./auth";

export async function centralApi(
  endpoint: keyof typeof API,
  entry: "POST" | "GET" | "PUT" | "DELETE",
  data?: any
) {
  const accesToken = getToken();
  const finalObj =
    accesToken !== undefined
      ? { ...data, access_token: accesToken }
      : { ...data };

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${API[endpoint]}`,
      {
        method: entry,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalObj),
      }
    );

    if (finalObj?.exportcsv === true) {
      const data = await response.text();
      if (data === undefined || data === null) {
        return;
      } else {
        return data;
      }
    }
    const data = await response.json();
    if (data === undefined || data === null) {
      return;
    } else {
      return data;
    }
  } catch (error) {
    console.log("error ::: ", error);
  }
}
