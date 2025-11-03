import type { CartItem } from "@/types/cart";
import { formatPrice } from "@/lib/product-utils";

/**
 * @file checkout-order-summary.tsx
 * @description 주문 페이지용 주문 요약 컴포넌트
 *
 * 주문 페이지에서 상품 목록과 총 금액을 표시하는 컴포넌트입니다.
 */

interface CheckoutOrderSummaryProps {
  cartItems: CartItem[];
}

export default function CheckoutOrderSummary({
  cartItems,
}: CheckoutOrderSummaryProps) {
  // 총 금액 계산
  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  // MVP에서는 배송비 0원 고정
  const shippingFee = 0;
  const finalAmount = totalAmount + shippingFee;

  return (
    <div className="sticky top-4 space-y-6 p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        주문 요약
      </h2>

      {/* 상품 목록 */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          상품 목록
        </h3>
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-start gap-4 text-sm"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {item.product.name}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {formatPrice(item.product.price)} × {item.quantity}개
                </p>
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                {formatPrice(item.product.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 구분선 */}
      <div className="border-t border-gray-200 dark:border-gray-800"></div>

      {/* 금액 요약 */}
      <div className="space-y-3">
        {/* 총 상품 금액 */}
        <div className="flex justify-between items-center">
          <span className="text-base text-gray-700 dark:text-gray-300">
            총 상품 금액
          </span>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatPrice(totalAmount)}
          </span>
        </div>

        {/* 배송비 */}
        <div className="flex justify-between items-center">
          <span className="text-base text-gray-700 dark:text-gray-300">
            배송비
          </span>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {shippingFee === 0 ? "무료" : formatPrice(shippingFee)}
          </span>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-200 dark:border-gray-800"></div>

        {/* 최종 결제 예상 금액 */}
        <div className="flex justify-between items-center">
          <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            결제 예상 금액
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatPrice(finalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
