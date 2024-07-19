import { GetTwonshipListTypes, TownshipDataType } from "@/src/types/township";
import { centralApi } from "../api-central";

export async function GetTownshipList(crediential: GetTwonshipListTypes) {
  return await centralApi("townshipListAPI", "POST", crediential);
} 

export async function CreateTownship(crediential: TownshipDataType) {
  return await centralApi("townshipCreateAPI", "POST", crediential);
}

export async function UpdateTownship(crediential: TownshipDataType) {
  return await centralApi("townshipUpdateAPI", "POST", crediential);
}
export async function DeleteTownship(crediential: TownshipDataType) {
  return await centralApi("townshipDeleteAPI", "POST", crediential);
} 
