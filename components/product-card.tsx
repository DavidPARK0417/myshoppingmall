import Link from "next/link";
import type { Product } from "@/types/product";
import { getCategoryLabel } from "@/lib/categories";

/**
 * @file product-card.tsx
 * @description 상품 카드 컴포넌트
 *
 * 개별 상품을 카드 형태로 표시하는 컴포넌트입니다.
 * 이름, 가격, 카테고리, 재고 상태를 표시합니다.
 */

interface ProductCardProps {
  product: Product;
}

/**
 * 가격을 원화 형식으로 포맷팅
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * 재고 상태를 표시할 텍스트 반환
 */
function getStockStatus(stockQuantity: number): {
  text: string;
  className: string;
} {
  if (stockQuantity === 0) {
    return { text: "품절", className: "text-red-500 font-semibold" };
  }
  if (stockQuantity < 10) {
    return { text: `재고 부족 (${stockQuantity}개)`, className: "text-orange-500" };
  }
  return { text: "재고 있음", className: "text-green-600" };
}

export default function ProductCard({ product }: ProductCardProps) {
  const stockStatus = getStockStatus(product.stock_quantity);
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className={`block border rounded-lg p-4 transition-all hover:shadow-lg ${
        isOutOfStock
          ? "opacity-60 cursor-not-allowed"
          : "hover:border-primary cursor-pointer"
      }`}
    >
      <div className="flex flex-col gap-3">
        {/* 상품 이름 */}
        <h3 className="font-semibold text-lg line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>

        {/* 상품 설명 (있을 경우) */}
        {product.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* 카테고리 및 재고 상태 */}
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
            {getCategoryLabel(product.category)}
          </span>
          <span className={stockStatus.className}>{stockStatus.text}</span>
        </div>

        {/* 가격 */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-2xl font-bold">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}

