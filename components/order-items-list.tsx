import type { OrderItem } from "@/types/order";
import { formatPrice } from "@/lib/product-utils";

/**
 * @file order-items-list.tsx
 * @description 주문 상품 목록 컴포넌트
 *
 * 주문 상세 페이지에서 주문 상품 목록을 표시하는 컴포넌트입니다.
 */

interface OrderItemsListProps {
  items: OrderItem[];
}

export default function OrderItemsList({ items }: OrderItemsListProps) {
  // 총 상품 금액 계산
  const totalAmount = items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  console.log("[order-items-list] 주문 상품 목록 렌더링", {
    itemCount: items.length,
    totalAmount,
  });

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        주문 상품이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        주문 상품
      </h3>
      <div className="space-y-3">
        {items.map((item) => {
          const itemTotal = item.price * item.quantity;
          return (
            <div
              key={item.id}
              className="flex justify-between items-start gap-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {item.product_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {formatPrice(item.price)} × {item.quantity}개
                </p>
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                {formatPrice(itemTotal)}
              </p>
            </div>
          );
        })}
      </div>

      {/* 구분선 */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
            총 상품 금액
          </span>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {formatPrice(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
