"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSortLabel, isValidSortOption, type SortOption } from "@/lib/sort";
import { cn } from "@/lib/utils";

/**
 * @file product-sort-filter-home.tsx
 * @description 홈페이지용 정렬 필터 컴포넌트
 *
 * 홈페이지에서 상품을 정렬할 수 있는 버튼 형태의 UI 컴포넌트입니다.
 * ProductCategoryFilter와 동일한 버튼 형태 UI를 사용합니다.
 *
 * @param basePath - 필터링된 페이지의 기본 경로 (기본값: '/')
 */

interface ProductSortFilterHomeProps {
  basePath?: string;
}

/**
 * 홈페이지에서 사용할 정렬 옵션 목록 (name 제외)
 */
const HOME_SORT_OPTIONS: SortOption[] = ["latest", "popular", "price-asc", "price-desc"];

export default function ProductSortFilterHome({
  basePath = "/",
}: ProductSortFilterHomeProps) {
  const searchParams = useSearchParams();
  const sortByParam = searchParams.get("sortBy");
  const selectedSort: SortOption | null = isValidSortOption(sortByParam)
    ? sortByParam
    : null;

  console.log("[product-sort-filter-home] 정렬 필터 렌더링", {
    selectedSort,
    sortByParam,
  });

  // 정렬 링크 URL 생성 (기존 카테고리 파라미터 유지)
  const getSortUrl = (sortBy: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sortBy);

    // 카테고리 파라미터는 유지
    const queryString = params.toString();
    return `/?${queryString}#all-products`;
  };

  // 링크 클릭 핸들러 (스크롤 처리)
  const handleLinkClick = () => {
    // 클릭 시 전체 상품 섹션으로 스크롤
    setTimeout(() => {
      const allProductsSection = document.getElementById("all-products");
      if (allProductsSection) {
        allProductsSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {/* 정렬 버튼들 */}
      {HOME_SORT_OPTIONS.map((sortBy) => (
        <Link
          key={sortBy}
          href={getSortUrl(sortBy)}
          onClick={handleLinkClick}
        >
          <Button
            variant={selectedSort === sortBy ? "default" : "outline"}
            size="sm"
            className={cn(
              "transition-all",
              selectedSort === sortBy && "font-semibold",
            )}
          >
            {getSortLabel(sortBy)}
          </Button>
        </Link>
      ))}
    </div>
  );
}

