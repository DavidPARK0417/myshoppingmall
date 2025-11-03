"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAllSortOptions,
  getSortLabel,
  isValidSortOption,
  type SortOption,
} from "@/lib/sort";

/**
 * @file product-sort-filter.tsx
 * @description 상품 정렬 필터 컴포넌트
 *
 * 상품 목록 페이지에서 상품을 정렬할 수 있는 드롭다운 컴포넌트입니다.
 * 최신순, 이름순, 인기순 옵션을 제공합니다.
 */

export default function ProductSortFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sortByParam = searchParams.get("sortBy");
  const currentSort: SortOption = isValidSortOption(sortByParam)
    ? sortByParam
    : "latest";

  console.log("[product-sort-filter] 정렬 필터 렌더링", {
    currentSort,
    sortByParam,
  });

  // 정렬 변경 핸들러
  const handleSortChange = (value: string) => {
    console.log("[product-sort-filter] 정렬 변경", {
      newSort: value,
      currentSort,
    });

    const newSort = value as SortOption;
    const params = new URLSearchParams(searchParams.toString());

    // 정렬 파라미터 업데이트
    if (newSort === "latest") {
      // 기본값이므로 파라미터에서 제거
      params.delete("sortBy");
    } else {
      params.set("sortBy", newSort);
    }

    // 페이지는 1로 리셋 (정렬 변경 시 첫 페이지부터 보는 것이 좋음)
    params.delete("page");

    // URL 업데이트
    const newUrl = params.toString()
      ? `/products?${params.toString()}`
      : "/products";
    router.push(newUrl);
  };

  const sortOptions = getAllSortOptions();

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="sort-select"
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        정렬
      </label>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger
          id="sort-select"
          className="w-full sm:w-[180px]"
          aria-label="정렬 옵션 선택"
        >
          <SelectValue placeholder="정렬 선택" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {sortOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {getSortLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

