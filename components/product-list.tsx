import type { Product } from "@/types/product";
import ProductCard from "./product-card";

/**
 * @file product-list.tsx
 * @description 상품 목록 컴포넌트
 *
 * 상품 배열을 받아 그리드 형태로 표시하는 컴포넌트입니다.
 * 반응형 그리드 레이아웃을 사용합니다.
 */

interface ProductListProps {
  products: Product[];
  emptyMessage?: string;
}

export default function ProductList({
  products,
  emptyMessage = "상품이 없습니다.",
}: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

