import { deleteCookie, getCookie, setCookie } from "cookies-next";
import CryptoJS from "crypto-js";
const hashTrigger = process.env.NEXT_PUBLIC_HASHCODE as string;
// console.log("hashTrigger ::: ", hashTrigger);
const AuthStoreName = "auth";

interface AcceptedEncrypted {
  value: any;
  storageName: string;
}

const _encryptedSave = ({ value, storageName }: AcceptedEncrypted) => {
  const cipherValue = CryptoJS.AES.encrypt(
    JSON.stringify(value),
    hashTrigger
  ).toString();

  const expirationTime = new Date();
  expirationTime.setHours(expirationTime.getHours() + 24);

  if (typeof window !== "undefined") {
    setCookie(storageName, cipherValue, {
      expires: expirationTime,
    });
  }
};

const _decryptedExecute = (value: string) => {
  try {
    if (typeof window !== "undefined") {
      const data = getCookie(value);
      // console.log("data ::: ", data);
      if (data === null || data === undefined) {
        return null;
      }
      const bytes = CryptoJS.AES.decrypt(data, hashTrigger);
      // console.log("bytes :>> ", bytes);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      return decryptedData;
    }
  } catch (error) {
    removeAuth();
  }
};

const saveAuth = (data: any) => {
  const obj = {
    value: data,
    storageName: AuthStoreName,
  };
  _encryptedSave(obj);
  return data;
};

const getToken = () => {
  if (typeof window !== "undefined") {
    return getCookie("access_token");
  }
};
const getAuth = () => {
  return _decryptedExecute(AuthStoreName);
};
const removeAuth = () => {
  if (typeof window !== "undefined") {
    deleteCookie(AuthStoreName);
    deleteCookie("access_token");
  }
};
export { saveAuth, getAuth, getToken, removeAuth };
