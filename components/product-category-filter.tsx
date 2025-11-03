"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { getAllCategories, getCategoryLabel } from "@/lib/categories";
import { cn } from "@/lib/utils";

/**
 * @file product-category-filter.tsx
 * @description 카테고리 필터 컴포넌트
 *
 * 상품 목록 페이지 또는 홈페이지에서 카테고리별로 필터링할 수 있는 UI 컴포넌트입니다.
 * 현재 선택된 카테고리를 강조 표시합니다.
 *
 * @param basePath - 필터링된 페이지의 기본 경로 (기본값: '/products')
 */

interface ProductCategoryFilterProps {
  basePath?: string;
}

export default function ProductCategoryFilter({
  basePath = "/products",
}: ProductCategoryFilterProps) {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const categories = getAllCategories();
  const isHomePage = basePath === "/";
  const hasScrolledRef = useRef(false);

  // 카테고리가 변경되었을 때 전체 상품 섹션으로 스크롤 (홈페이지에서만)
  useEffect(() => {
    if (!isHomePage) return;

    // URL에서 showAll 파라미터 확인
    const showAll = searchParams.get("showAll") === "true";

    // URL에 해시가 있거나 카테고리가 선택되었거나 showAll이 true일 때 스크롤
    const shouldScroll =
      selectedCategory || showAll || window.location.hash === "#all-products";

    if (shouldScroll && !hasScrolledRef.current) {
      // 페이지 렌더링 완료 후 스크롤
      const timer = setTimeout(() => {
        const allProductsSection = document.getElementById("all-products");
        if (allProductsSection) {
          console.log("[category-filter] 전체 상품 섹션으로 스크롤", {
            selectedCategory,
            showAll,
          });
          allProductsSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          hasScrolledRef.current = true;
        }
      }, 200); // 렌더링 시간을 고려하여 약간 더 긴 지연

      return () => clearTimeout(timer);
    }

    // 카테고리가 없고 showAll도 없을 때 스크롤 플래그 리셋
    if (!selectedCategory && !showAll) {
      hasScrolledRef.current = false;
    }
  }, [selectedCategory, isHomePage, searchParams]);

  // 링크 클릭 핸들러 (스크롤 처리)
  const handleLinkClick = () => {
    if (isHomePage) {
      // 클릭 시 즉시 스크롤 플래그 리셋하여 useEffect가 다시 실행되도록
      hasScrolledRef.current = false;
    }
  };

  // 전체 상품 링크 URL 생성
  const getFullProductsUrl = () => {
    if (isHomePage) {
      // "전체" 버튼 클릭 시 showAll=true 파라미터 추가
      return "/?showAll=true#all-products";
    }
    return basePath;
  };

  // 카테고리 링크 URL 생성
  const getCategoryUrl = (category: string) => {
    if (isHomePage) {
      return `/?category=${category}#all-products`;
    }
    return `${basePath}?category=${category}`;
  };

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {/* 전체 상품 버튼 */}
      <Link
        href={getFullProductsUrl()}
        replace={!isHomePage}
        onClick={handleLinkClick}
      >
        <Button
          variant={
            selectedCategory === null && searchParams.get("showAll") === "true"
              ? "default"
              : selectedCategory === null
              ? "outline"
              : "outline"
          }
          size="sm"
          className={cn(
            "transition-all",
            selectedCategory === null &&
              searchParams.get("showAll") === "true" &&
              "font-semibold",
          )}
        >
          전체
        </Button>
      </Link>

      {/* 카테고리 버튼들 */}
      {categories.map((category) => (
        <Link
          key={category}
          href={getCategoryUrl(category)}
          replace={!isHomePage}
          onClick={handleLinkClick}
        >
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
