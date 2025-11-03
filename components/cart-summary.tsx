import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/product-utils";

/**
 * @file cart-summary.tsx
 * @description 장바구니 요약 컴포넌트
 *
 * 장바구니 페이지에서 총 금액과 주문하기 버튼을 표시하는 컴포넌트입니다.
 */

interface CartSummaryProps {
  totalAmount: number;
  itemCount: number;
}

export default function CartSummary({
  totalAmount,
  itemCount,
}: CartSummaryProps) {
  // MVP에서는 배송비 0원 고정
  const shippingFee = 0;
  const finalAmount = totalAmount + shippingFee;

  return (
    <div className="sticky top-4 space-y-6 p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        주문 요약
      </h2>

      <div className="space-y-4">
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

      {/* 주문하기 버튼 */}
      <div className="pt-4">
        <Button asChild size="lg" className="w-full" disabled={itemCount === 0}>
          <Link href="/checkout">주문하기 ({itemCount}개)</Link>
        </Button>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          * 주문하기 버튼 클릭 시 주문 페이지로 이동합니다
        </p>
      </div>
    </div>
  );
}
