export interface RegionDataType {
  id?: number | string;
  name?: string;
  createdAt?: string;
}

export interface GetRegionListTypes {
  page: number;
  per_page: number | string;
}

export interface CreateRegionTypes {
  name?: string;
  id?: number | string;
}
 