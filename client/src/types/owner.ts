interface TagsType {
  name: string;
  sport_type_id: number;
}

export interface OwnerDataType {
  address: string;
  avatar: string;
  business_email: string;
  business_logo: string;
  business_name: string;
  business_phone: string;
  court_limit: number;
  createdAt: string;
  data_id: string;
  email: string;
  id: number;
  lang: string;
  marketing_post_limit: number;
  name: string;
  nrc_back: string;
  nrc_front: string;
  nrc_no: string;
  push_notification_limit: number;
  phone: string;
  status: number | string;
  tags: TagsType[];
  kpay_name?: string;
  kpay_no?: string;
  kbz_banking_no?: string;
  wavepay_name?: string;
  wavepay_no?: string;
  cb_banking_no?: string;
  uab_pay_no?: string;
  uab_banking_no?: string;
  aya_pay_no?: string;
  aya_banking_no?: string;
}


