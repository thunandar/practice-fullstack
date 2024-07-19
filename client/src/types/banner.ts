export type BannerData = {
  id?: number | string;
  title?: string;
  body?: string;
  url?: string;
  mobile_image?: string;
  web_image?: string;
  createdAt?: string;
};

export type GetBannerListType = {
  page: number;
  per_page: number | string;
};
