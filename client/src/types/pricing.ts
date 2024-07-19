export interface PricingDataType {
  id?: number | string;
  name: string;
  price: {
    monthly: number;
    quarterly: number;
    halfYearly: number;
    yearly: number; 
  };
  court_limit: number;
  push_notification_limit: number;
  marketing_post_limit: number;
  order: number;
}

export interface GetPricingListTypes {
  page: number;
  per_page: number | string;
}

export interface CreatePricingTypes {
  name?: string;
  id?: number | string;
}
