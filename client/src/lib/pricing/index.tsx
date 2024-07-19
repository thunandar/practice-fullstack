import { centralApi } from "../api-central";
import { GetPricingListTypes, CreatePricingTypes } from "../../types/pricing";

export async function GetPricingList(crediential: GetPricingListTypes) {
  return await centralApi("pricingListAPI", "POST", crediential);
}

export async function CreatePricing(crediential: CreatePricingTypes) {
  return await centralApi("pricingCreateAPI", "POST", crediential);
}

export async function UpdatePricing(crediential: CreatePricingTypes) {
  return await centralApi("pricingUpdateAPI", "POST", crediential);
}
export async function DeletePricing(crediential: CreatePricingTypes) {
  return await centralApi("pricingDeleteAPI", "POST", crediential);
}