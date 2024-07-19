import { centralApi } from "../api-central";
import { CreateRegionTypes, GetRegionListTypes } from "../../types/region";

export async function GetRegionList(crediential: GetRegionListTypes) {
  return await centralApi("regionListAPI", "POST", crediential);
}

export async function CreateRegion(crediential: CreateRegionTypes) {
  return await centralApi("regionCreateAPI", "POST", crediential);
}

export async function UpdateRegion(crediential: CreateRegionTypes) {
  return await centralApi("regionUpdateAPI", "POST", crediential);
}
export async function DeleteRegion(crediential: CreateRegionTypes) {
  return await centralApi("regionDeleteAPI", "POST", crediential);
}
