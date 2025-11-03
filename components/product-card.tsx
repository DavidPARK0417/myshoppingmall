import Link from "next/link";
import type { Product } from "@/types/product";
import { getCategoryLabel } from "@/lib/categories";
import { cn } from "@/lib/utils";

/**
 * @file product-card.tsx
 * @description 상품 카드 컴포넌트
 *
 * 개별 상품을 카드 형태로 표시하는 컴포넌트입니다.
 * 반응형 디자인으로 다양한 화면 크기에 최적화되어 있습니다.
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
    return {
      text: "품절",
      className: "text-red-500 dark:text-red-400 font-semibold",
    };
  }
  if (stockQuantity < 10) {
    return {
      text: `재고 부족 (${stockQuantity}개)`,
      className: "text-orange-500 dark:text-orange-400",
    };
  }
  return {
    text: "재고 있음",
    className: "text-green-600 dark:text-green-400",
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const stockStatus = getStockStatus(product.stock_quantity);
  const isOutOfStock = product.stock_quantity === 0;

  console.log("[product-card] 상품 카드 렌더링", {
    id: product.id,
    name: product.name,
    price: product.price,
    stockQuantity: product.stock_quantity,
  });

  return (
    <Link
      href={`/products/${product.id}`}
      className={cn(
        "group block h-full",
        "border border-gray-200 dark:border-gray-800",
        "rounded-lg overflow-hidden",
        "bg-white dark:bg-gray-900",
        "transition-all duration-300",
        "hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50",
        "hover:border-primary hover:-translate-y-1",
        isOutOfStock && "opacity-60 cursor-not-allowed hover:translate-y-0",
        !isOutOfStock && "cursor-pointer",
      )}
      aria-label={`${product.name} 상품 보기`}
    >
      <div className="flex flex-col h-full p-4 sm:p-5 gap-3 sm:gap-4">
        {/* 상품 이름 */}
        <h3 className="font-semibold text-base sm:text-lg line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* 상품 설명 (있을 경우) */}
        {product.description && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex-grow">
            {product.description}
          </p>
        )}

        {/* 카테고리 및 재고 상태 */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span
            className={cn(
              "px-2 py-1 text-xs sm:text-sm rounded",
              "bg-gray-100 dark:bg-gray-800",
              "text-gray-700 dark:text-gray-300",
            )}
          >
            {product.category ? getCategoryLabel(product.category) : "미분류"}
          </span>
          <span
            className={cn(
              "text-xs sm:text-sm font-medium",
              stockStatus.className,
            )}
          >
            {stockStatus.text}
          </span>
        </div>

        {/* 가격 */}
        <div className="flex items-baseline gap-2 mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
