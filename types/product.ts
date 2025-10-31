/**
 * @file product.ts
 * @description 상품 타입 정의
 *
 * products 테이블의 스키마를 기반으로 한 Product 타입 정의입니다.
 */

export interface Product {
  id: string; // UUID
  name: string;
  description: string | null;
  price: number; // DECIMAL(10,2)
  category: string | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string; // TIMESTAMP WITH TIME ZONE
  updated_at: string; // TIMESTAMP WITH TIME ZONE
}

