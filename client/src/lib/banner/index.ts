import { BannerData, GetBannerListType } from "./../../types/banner";
import { centralApi } from "../api-central";

export async function GetBannerList(crediential: GetBannerListType) {
  return await centralApi("bannerListAPI", "POST", crediential);
}

export async function CreateBanner(crediential: BannerData) {
  return await centralApi("bannerCreateAPI", "POST", crediential);
}

export async function UpdateBanner(crediential: BannerData) {
  return await centralApi("bannerUpdateAPI", "POST", crediential);
}
export async function DeleteBanner(crediential: BannerData) {
  return await centralApi("bannerDeleteAPI", "POST", crediential);
}
