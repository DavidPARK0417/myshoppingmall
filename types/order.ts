/**
 * @file order.ts
 * @description 주문 타입 정의
 *
 * orders 및 order_items 테이블의 스키마를 기반으로 한 타입 정의입니다.
 */

/**
 * 배송지 정보
 */
export interface ShippingAddress {
  name: string; // 수령인 이름
  phone: string; // 연락처
  postcode: string; // 우편번호
  address: string; // 기본 주소
  detailAddress: string; // 상세 주소
}

/**
 * 주문 상태
 */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

/**
 * 주문 정보
 */
export interface Order {
  id: string; // UUID
  clerk_id: string; // Clerk User ID
  total_amount: number; // DECIMAL(10,2)
  status: OrderStatus;
  shipping_address: ShippingAddress | null; // JSONB
  order_note: string | null;
  created_at: string; // TIMESTAMP WITH TIME ZONE
  updated_at: string; // TIMESTAMP WITH TIME ZONE
}

/**
 * 주문 상세 아이템
 */
export interface OrderItem {
  id: string; // UUID
  order_id: string; // UUID
  product_id: string; // UUID
  product_name: string;
  quantity: number;
  price: number; // DECIMAL(10,2)
  created_at: string; // TIMESTAMP WITH TIME ZONE
}

/**
 * 주문 정보 (주문 상세 아이템 포함)
 */
export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}
