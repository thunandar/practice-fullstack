interface RegionType {
  region_id: string;
  name: string;
}

export interface TownshipDataType {
  id?: number;
  name: string;
  region?: RegionType;
  createdAt?: string;
  region_id?: string;
}

export interface GetTwonshipListTypes {
  page: number;
  per_page: number | string;
  region_id: string; 
}
