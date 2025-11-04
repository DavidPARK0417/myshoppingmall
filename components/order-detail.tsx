import type { OrderWithItems } from "@/types/order";
import { formatPrice } from "@/lib/product-utils";
import {
  formatOrderStatus,
  getOrderStatusColor,
  formatOrderDate,
} from "@/lib/order-utils";
import { cn } from "@/lib/utils";
import OrderItemsList from "@/components/order-items-list";
import type { ShippingAddress } from "@/types/order";

/**
 * @file order-detail.tsx
 * @description 주문 상세 정보 표시 컴포넌트
 *
 * 주문 상세 페이지에서 주문 정보를 표시하는 컴포넌트입니다.
 * 주문 기본 정보, 배송지 정보, 주문 상품 목록, 주문 금액 요약, 주문 메모를 표시합니다.
 */

interface OrderDetailProps {
  order: OrderWithItems;
}

export default function OrderDetail({ order }: OrderDetailProps) {
  const statusColor = getOrderStatusColor(order.status);
  const statusText = formatOrderStatus(order.status);
  const orderDate = formatOrderDate(order.created_at);
  const updatedDate = formatOrderDate(order.updated_at);

  const shippingAddress = order.shipping_address as ShippingAddress | null;

  // 배송비는 MVP에서 0원 고정
  const shippingFee = 0;
  const finalAmount = order.total_amount;

  console.log("[order-detail] 주문 상세 렌더링", {
    orderId: order.id,
    status: order.status,
    itemCount: order.order_items.length,
  });

  return (
    <div className="space-y-6">
      {/* 주문 기본 정보 */}
      <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          주문 정보
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              주문 번호
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {order.id}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              주문 날짜
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {orderDate}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              주문 상태
            </span>
            <span
              className={cn(
                "px-2 py-1 text-xs font-medium rounded",
                statusColor.bg,
                statusColor.text,
              )}
            >
              {statusText}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              최종 업데이트
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {updatedDate}
            </span>
          </div>
        </div>
      </div>

      {/* 배송지 정보 */}
      {shippingAddress && (
        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            배송지 정보
          </h2>
          <div className="space-y-2 text-sm">
            <p className="text-gray-900 dark:text-gray-100">
              <span className="text-gray-600 dark:text-gray-400">수령인:</span>{" "}
              {shippingAddress.name}
            </p>
            <p className="text-gray-900 dark:text-gray-100">
              <span className="text-gray-600 dark:text-gray-400">연락처:</span>{" "}
              {shippingAddress.phone}
            </p>
            <p className="text-gray-900 dark:text-gray-100">
              <span className="text-gray-600 dark:text-gray-400">
                우편번호:
              </span>{" "}
              {shippingAddress.postcode}
            </p>
            <p className="text-gray-900 dark:text-gray-100">
              <span className="text-gray-600 dark:text-gray-400">주소:</span>{" "}
              {shippingAddress.address}
            </p>
            {shippingAddress.detailAddress && (
              <p className="text-gray-900 dark:text-gray-100">
                <span className="text-gray-600 dark:text-gray-400">
                  상세 주소:
                </span>{" "}
                {shippingAddress.detailAddress}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 주문 상품 목록 */}
      <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
        <OrderItemsList items={order.order_items} />
      </div>

      {/* 주문 금액 요약 */}
      <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          주문 금액
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-base text-gray-700 dark:text-gray-300">
              총 상품 금액
            </span>
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {formatPrice(order.total_amount - shippingFee)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-base text-gray-700 dark:text-gray-300">
              배송비
            </span>
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {shippingFee === 0 ? "무료" : formatPrice(shippingFee)}
            </span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                최종 결제 금액
              </span>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatPrice(finalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 주문 메모 */}
      {order.order_note && (
        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            주문 메모
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {order.order_note}
          </p>
        </div>
      )}
    </div>
  );
}
