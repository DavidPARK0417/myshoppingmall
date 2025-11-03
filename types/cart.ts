/**
 * @file cart.ts
 * @description 장바구니 타입 정의
 *
 * cart_items 테이블의 스키마를 기반으로 한 타입 정의입니다.
 */

import type { Product } from "./product";

/**
 * 장바구니 아이템 (상품 정보 포함)
 */
export interface CartItem {
  id: string; // UUID
  clerk_id: string; // Clerk User ID
  product_id: string; // UUID
  quantity: number;
  created_at: string; // TIMESTAMP WITH TIME ZONE
  updated_at: string; // TIMESTAMP WITH TIME ZONE
  product: Product; // 상품 정보 (JOIN)
}

/**
 * 장바구니 아이템 (DB에서 조회된 기본 형태)
 */
export interface CartItemRow {
  id: string;
  clerk_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}
