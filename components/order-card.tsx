import Link from "next/link";
import type { OrderWithItems } from "@/types/order";
import { formatPrice } from "@/lib/product-utils";
import {
  formatOrderStatus,
  getOrderStatusColor,
  formatOrderDate,
} from "@/lib/order-utils";
import { cn } from "@/lib/utils";

/**
 * @file order-card.tsx
 * @description 주문 카드 컴포넌트
 *
 * 마이페이지에서 개별 주문을 카드 형태로 표시하는 컴포넌트입니다.
 * 주문 번호, 날짜, 상태, 금액, 상품 미리보기를 표시합니다.
 */

interface OrderCardProps {
  order: OrderWithItems;
}

export default function OrderCard({ order }: OrderCardProps) {
  const statusColor = getOrderStatusColor(order.status);
  const statusText = formatOrderStatus(order.status);
  const orderDate = formatOrderDate(order.created_at);

  // 주문 상품 미리보기 (첫 번째 상품명 + "외 N개")
  const firstProduct = order.order_items[0];
  const remainingCount = order.order_items.length - 1;
  const productPreview = firstProduct
    ? remainingCount > 0
      ? `${firstProduct.product_name} 외 ${remainingCount}개`
      : firstProduct.product_name
    : "상품 정보 없음";

  console.log("[order-card] 주문 카드 렌더링", {
    orderId: order.id,
    status: order.status,
    itemCount: order.order_items.length,
  });

  return (
    <Link
      href={`/my-page/orders/${order.id}`}
      className={cn(
        "block h-full",
        "border border-gray-200 dark:border-gray-800",
        "rounded-lg overflow-hidden",
        "bg-white dark:bg-gray-900",
        "transition-all duration-300",
        "hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50",
        "hover:border-primary hover:-translate-y-1",
        "cursor-pointer",
      )}
      aria-label={`주문 ${order.id} 상세 보기`}
    >
      <div className="flex flex-col h-full p-4 sm:p-5 gap-3 sm:gap-4">
        {/* 주문 번호 및 상태 */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100 truncate">
              주문 번호: {order.id.slice(0, 8)}...
            </h3>
          </div>
          <span
            className={cn(
              "px-2 py-1 text-xs sm:text-sm font-medium rounded whitespace-nowrap",
              statusColor.bg,
              statusColor.text,
            )}
          >
            {statusText}
          </span>
        </div>

        {/* 주문 날짜 */}
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {orderDate}
        </p>

        {/* 주문 상품 미리보기 */}
        <div className="flex-1">
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 line-clamp-2">
            {productPreview}
          </p>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-100 dark:border-gray-800"></div>

        {/* 총 주문 금액 */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            총 주문 금액
          </span>
          <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatPrice(order.total_amount)}
          </span>
        </div>
      </div>
    </Link>
  );
}
