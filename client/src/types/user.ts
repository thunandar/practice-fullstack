// export type UserData = {
//   tags?: string[];
//   name?: string;
//   email?: string;
//   phone?: string;
//   avatar?: string;
//   region?: string | null;
//   township?: string | null;
//   lang?: string;
//   is_update_default_data?: boolean;
//   createdAt?: string;
//   id?: number;
//   data_id?: string;
// };

export type Tag = {
  name: string;
  sport_type_id: number;
};

type Region = {
  name: string;
  region_id: number;
};

type Township = {
  name: string;
  township_id: number;
};

export type UserData = {
  tags: Tag[];
  name: string;
  email: string;
  phone: string;
  avatar: string;
  region: Region;
  township: Township;
  lang: string;
  is_update_default_data: boolean;
  createdAt: string;
  id: number;
  data_id: string;
};
