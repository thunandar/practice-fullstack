export interface Court {
  name: string;
  phone: string;
  court_id: string;
}

export interface Owner {
  name: string;
  phone: string;
  email: string;
  owner_id: string;
  id: null | string;
}

export interface User {
  name: string;
  phone: string;
  email: string;
  user_id: string;
}

export interface BookingListsReturnDataType {
  court: Court;
  booking_time: string[];
  owner: Owner;
  booking_date: string;
  user: User;
  status: number;
  is_manual: boolean;
  createdAt: string;
  employee: null | string;
  discount_amount: string;
  total_amount: string;
  id: string;
  data_id: string;
  owner_id: string; 
}

export interface GetBookingListsTypes {
  page: number;
  per_page: number | string;
  owner_id: string; 
}
