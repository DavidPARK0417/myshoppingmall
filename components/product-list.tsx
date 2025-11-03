import type { Product } from "@/types/product";
import ProductCard from "./product-card";

/**
 * @file product-list.tsx
 * @description 상품 목록 컴포넌트
 *
 * 상품 배열을 받아 그리드 형태로 표시하는 컴포넌트입니다.
 * 반응형 그리드 레이아웃을 사용합니다.
 *
 * 반응형 브레이크포인트:
 * - 모바일 (기본): 1열
 * - 태블릿 (sm, 640px 이상): 2열
 * - 데스크톱 (lg, 1024px 이상): 3열
 * - 대형 화면 (xl, 1280px 이상): 4열
 */

interface ProductListProps {
  products: Product[];
  emptyMessage?: string;
}

export default function ProductList({
  products,
  emptyMessage = "상품이 없습니다.",
}: ProductListProps) {
  console.log("[product-list] 상품 목록 렌더링", {
    productCount: products.length,
  });

  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <p className="text-lg text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 반응형 그리드 레이아웃 */}
      <div
        className="grid gap-4 sm:gap-6"
        style={{
          gridTemplateColumns:
            "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
        }}
      >
        {products.map((product, index) => {
          console.log(`[product-list] 상품 ${index + 1} 렌더링`, {
            id: product.id,
            name: product.name,
          });
          return <ProductCard key={product.id} product={product} />;
        })}
      </div>
    </div>
  );
}
