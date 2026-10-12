export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  phone_verified: boolean;
  role: UserRole;
  loyalty_points: number;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  price: number;
  discount_percent: number;
  stock_quantity: number;
  images: string[];
  video_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at?: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at?: string;
  product?: Product;
}

export type OrderStatus = 'placed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  coupon_code?: string | null;
  shipping_address_id?: string | null;
  payment_method: string;
  payment_status: PaymentStatus;
  total: number;
  gift_message?: string | null;
  is_gift?: boolean;
  created_at: string;
  items?: OrderItem[];
  shipping_address?: Address;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name_snapshot: string;
  price_snapshot: number;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent?: number | null;
  discount_amount?: number | null;
  min_order_value: number;
  max_uses: number;
  times_used: number;
  active: boolean;
  expires_at?: string | null;
  created_at?: string;
}

export interface SpendDiscountTier {
  id: string;
  min_spend: number;
  discount_percent: number;
  created_at?: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string | null;
  bank_or_payment_method: string | null;
  discount_detail: string | null;
  image_url: string | null;
  active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface PointsSettings {
  id: string;
  points_per_currency_unit: number;
  point_name_singular: string;
  point_name_plural: string;
  point_to_coupon_conversion_rules: Array<{ points: number; discount_amount: number }>;
  updated_at?: string;
}

export interface PointsLedgerEntry {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  order_id?: string | null;
  created_at: string;
}

export interface RedeemableCoupon {
  id: string;
  points_cost: number;
  coupon_id: string;
  coupon?: Coupon;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_name?: string;
}

export interface HomepageContent {
  id: string;
  hero_image: string;
  hero_headline: string;
  hero_subheadline: string;
  about_us_text: string;
  updated_at?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  icon: string;
  sort_order?: number;
}
