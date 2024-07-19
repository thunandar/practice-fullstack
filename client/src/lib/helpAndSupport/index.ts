import { ContactMessageData, GetMessageList } from "@/src/types/help";
import { centralApi } from "../api-central";

export async function GetContactMessages(crediential: GetMessageList) {
  return await centralApi("contactListAPI", "POST", crediential);
}

export async function DeleteContactMessage(crediential: ContactMessageData) {
  return await centralApi("contactDeleteAPI", "POST", crediential);
}
