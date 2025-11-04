/**
 * @file order-utils.ts
 * @description 주문 관련 유틸리티 함수
 *
 * 주문 정보 표시에 사용되는 공통 유틸리티 함수들입니다.
 */

import type { OrderStatus } from "@/types/order";

/**
 * 주문 상태를 한글로 변환
 */
export function formatOrderStatus(status: OrderStatus): string {
  const statusMap: Record<OrderStatus, string> = {
    pending: "결제 대기",
    confirmed: "결제 완료",
    shipped: "배송 중",
    delivered: "배송 완료",
    cancelled: "취소됨",
  };

  return statusMap[status] || status;
}

/**
 * 주문 상태별 색상 반환
 */
export function getOrderStatusColor(status: OrderStatus): {
  bg: string;
  text: string;
} {
  const colorMap: Record<
    OrderStatus,
    { bg: string; text: string }
  > = {
    pending: {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-800 dark:text-yellow-300",
    },
    confirmed: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-800 dark:text-blue-300",
    },
    shipped: {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-800 dark:text-purple-300",
    },
    delivered: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-800 dark:text-green-300",
    },
    cancelled: {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-800 dark:text-gray-300",
    },
  };

  return colorMap[status] || {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-800 dark:text-gray-300",
  };
}

/**
 * 주문 날짜를 한글 포맷으로 변환
 */
export function formatOrderDate(dateString: string): string {
  return new Date(dateString).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

