/**
 * @file product-utils.ts
 * @description 상품 관련 유틸리티 함수
 *
 * 상품 정보 표시에 사용되는 공통 유틸리티 함수들입니다.
 */

/**
 * 가격을 원화 형식으로 포맷팅
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * 재고 상태를 표시할 텍스트 반환
 */
export function getStockStatus(stockQuantity: number): {
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

/**
 * 날짜를 한국어 형식으로 포맷팅
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
