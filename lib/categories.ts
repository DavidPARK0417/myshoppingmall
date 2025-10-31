/**
 * @file categories.ts
 * @description 카테고리 유틸리티
 *
 * 카테고리 코드를 한국어로 변환하는 유틸리티 함수입니다.
 */

const CATEGORY_LABELS: Record<string, string> = {
  electronics: "전자제품",
  clothing: "의류",
  books: "도서",
  food: "식품",
  sports: "스포츠",
  beauty: "뷰티",
  home: "생활/가정",
} as const;

/**
 * 카테고리 코드를 한국어 라벨로 변환
 * @param category - 카테고리 코드
 * @returns 한국어 라벨 또는 원본 코드 (매핑되지 않은 경우)
 */
export function getCategoryLabel(category: string | null): string {
  if (!category) return "기타";
  return CATEGORY_LABELS[category] ?? category;
}

/**
 * 모든 카테고리 코드 목록 반환
 * @returns 카테고리 코드 배열
 */
export function getAllCategories(): string[] {
  return Object.keys(CATEGORY_LABELS);
}

/**
 * 주요 카테고리 목록 반환 (홈페이지 섹션용)
 * @returns 주요 카테고리 코드 배열
 */
export function getFeaturedCategories(): string[] {
  return ["electronics", "clothing", "books", "food"];
}

