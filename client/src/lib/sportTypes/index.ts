import { centralApi } from "../api-central";
import { CreateSportTypesData, SportTypesList } from "@/src/types/sportType";

export async function GetSportTypesList(crediential: SportTypesList) {
  return await centralApi("sportTypesListAPI", "POST", crediential);
}

export async function CreateSportType(crediential: CreateSportTypesData) {
  return await centralApi("sportTypesCreateAPI", "POST", crediential);
}

export async function UpdateSportType(crediential: CreateSportTypesData) {
  return await centralApi("sportTypesUpdateAPI", "POST", crediential);
}
export async function DeleteSportType(crediential: CreateSportTypesData) {
  return await centralApi("sportTypesDeleteAPI", "POST", crediential);
}
