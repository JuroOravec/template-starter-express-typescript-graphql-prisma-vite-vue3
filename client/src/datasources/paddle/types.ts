export interface PaddleCheckoutSuccessEvent {
  checkout: PaddleCheckout;
  product: PaddleCheckoutProduct;
  user: PaddleCheckoutUser;
}

export interface PaddleCheckoutUser {
  /** E.g. `'497086'` */
  id: string;
  /** E.g. `'example@example.com'` */
  email: string;
  /** E.g. `'SK'` */
  country: string;
}

export interface PaddleCheckoutProduct {
  /** E.g. `51898` */
  id: number;
  /** E.g. `'Scraper Pre-order - Full Vote'` */
  name: string;
  /** E.g. `3` */
  quantity: number;
}

export interface PaddleCheckout {
  /** E.g. `'2023-06-05 11:41:06'` */
  created_at: string;
  completed: boolean;
  /** E.g. `'1492483-chre1263738f5d2-cda5ae134f'` */
  id: string;
  coupon: {
    /** UNKNOWN */
    coupon_code: null;
  };
  /** UNKNOWN */
  passthrough: any;
  prices: {
    customer: PaddlePrice;
    vendor: PaddlePrice;
  };
  /** UNKNOWN */
  redirect_url: any;
  /** E.g. `'newCheckout'` */
  test_variant: string;
}

export interface PaddleProduct {
  /** E.g. `1446770` */
  checkout_product_id: number;
  /** E.g. `51898` */
  product_id: number;
  /** E.g. `'Scraper Pre-order - Full Vote'` */
  name: string;
  /** E.g. `'Cast a vote for a scraper...'` */
  custom_message: string;
  /** E.g. `3` */
  quantity: number;
  allow_quantity: boolean;
  /** E.g. `'https://sandbox-static.paddle.com/assets/images/checkout/default_product_icon.png'` */
  icon_url: string;
  /** E.g. `1` */
  min_quantity: number;
  /** E.g. `1000` */
  max_quantity: number;
  /** E.g. `'USD'` */
  currency: string;
  /** Price details about the unit price */
  unit_price: PaddleProductPriceDetail;
  /** Price details for the whole purchase (unit_price * quantity) */
  line_price: PaddleProductPriceDetail;
  /** UNKNOWN */
  discounts: any[];
  /** E.g. `0.2` */
  tax_rate: number;
  /** UNKNOWN */
  recurring: any;
}

export interface PaddleProductPriceDetail {
  /** E.g. `16.67` */
  net: number;
  /** E.g. `20` */
  gross: number;
  /** E.g. `0` */
  net_discount: number;
  /** E.g. `0` */
  gross_discount: number;
  /** E.g. `16.67` */
  net_after_discount: number;
  /** E.g. `20` */
  gross_after_discount: number;
  /** E.g. `3.33` */
  tax: number;
  /** E.g. `3.33` */
  tax_after_discount: number;
}

export interface PaddlePrice {
  /** E.g. `'USD'` */
  currency: string;
  /** E.g. `'20.00'` */
  unit: string;
  /** E.g. `'3.33'` */
  unit_tax: string;
  /** E.g. `'60.00'` */
  total: string;
  /** E.g. `'10.00'` */
  total_tax: string;
  items: PaddleProduct[];
}
