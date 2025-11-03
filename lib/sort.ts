/**
 * @file sort.ts
 * @description 정렬 옵션 유틸리티
 *
 * 상품 목록 페이지에서 사용할 정렬 옵션을 정의합니다.
 */

/**
 * 정렬 옵션 타입
 */
export type SortOption = "latest" | "name" | "popular" | "price-asc" | "price-desc";

/**
 * 정렬 옵션 라벨 매핑 (한국어)
 */
export const SORT_LABELS: Record<SortOption, string> = {
  latest: "최신순",
  name: "이름순",
  popular: "인기순",
  "price-asc": "낮은 가격순",
  "price-desc": "높은 가격순",
} as const;

/**
 * 정렬 옵션 코드를 한국어 라벨로 변환
 * @param sortBy - 정렬 옵션 코드
 * @returns 한국어 라벨 또는 기본값 (최신순)
 */
export function getSortLabel(sortBy: string | null | undefined): string {
  if (!sortBy) return SORT_LABELS.latest;
  return SORT_LABELS[sortBy as SortOption] ?? SORT_LABELS.latest;
}

/**
 * 모든 정렬 옵션 목록 반환
 * @returns 정렬 옵션 코드 배열
 */
export function getAllSortOptions(): SortOption[] {
  return Object.keys(SORT_LABELS) as SortOption[];
}

/**
 * 정렬 옵션이 유효한지 확인
 * @param sortBy - 확인할 정렬 옵션
 * @returns 유효한 정렬 옵션인지 여부
 */
export function isValidSortOption(
  sortBy: string | null | undefined,
): sortBy is SortOption {
  if (!sortBy) return false;
  return sortBy in SORT_LABELS;
}

