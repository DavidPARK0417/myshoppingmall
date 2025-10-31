"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getAllCategories, getCategoryLabel } from "@/lib/categories";
import { cn } from "@/lib/utils";

/**
 * @file product-category-filter.tsx
 * @description 카테고리 필터 컴포넌트
 *
 * 상품 목록 페이지에서 카테고리별로 필터링할 수 있는 UI 컴포넌트입니다.
 * 현재 선택된 카테고리를 강조 표시합니다.
 */

export default function ProductCategoryFilter() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const categories = getAllCategories();

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {/* 전체 상품 버튼 */}
      <Link href="/products" replace>
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          className={cn(
            "transition-all",
            selectedCategory === null && "font-semibold",
          )}
        >
          전체
        </Button>
      </Link>

      {/* 카테고리 버튼들 */}
      {categories.map((category) => (
        <Link key={category} href={`/products?category=${category}`} replace>
          <Button
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            className={cn(
              "transition-all",
              selectedCategory === category && "font-semibold",
            )}
          >
            {getCategoryLabel(category)}
          </Button>
        </Link>
      ))}
    </div>
  );
}
