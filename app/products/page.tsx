import { Suspense } from "react";
import { getProducts, getProductsCount } from "@/actions/products";
import ProductList from "@/components/product-list";
import ProductCategoryFilter from "@/components/product-category-filter";
import ProductSortFilter from "@/components/product-sort-filter";
import { getCategoryLabel } from "@/lib/categories";
import { isValidSortOption, type SortOption } from "@/lib/sort";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * @file page.tsx
 * @description 상품 목록 페이지
 *
 * 전체 상품 목록 또는 카테고리별 상품 목록을 표시하는 페이지입니다.
 * 페이지네이션, 카테고리 필터링, 정렬 기능을 지원합니다.
 */

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
    sortBy?: string;
  }>;
}

const ITEMS_PER_PAGE = 12;

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category || undefined;

  // 정렬 파라미터 파싱 및 검증
  const sortByParam = params.sortBy;
  const sortBy: SortOption = isValidSortOption(sortByParam)
    ? sortByParam
    : "latest";

  // 페이지 번호 파싱 및 검증
  let currentPage = parseInt(params.page || "1", 10);
  if (isNaN(currentPage) || currentPage < 1) {
    currentPage = 1;
  }

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  console.log("[products/page] 상품 목록 페이지 렌더링", {
    category,
    sortBy,
    currentPage,
    offset,
  });

  // 병렬로 데이터 조회
  const [products, totalCount] = await Promise.all([
    getProducts({
      category,
      sortBy,
      limit: ITEMS_PER_PAGE,
      offset,
    }),
    getProductsCount(category),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // 페이지 범위 검증: currentPage가 totalPages보다 크면 totalPages로 조정
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // 페이지네이션 표시 범위 상수 (현재 페이지 ± 이 범위만 표시)
  const PAGE_RANGE = 2;

  console.log("[products/page] 데이터 로드 완료", {
    productCount: products.length,
    totalCount,
    totalPages,
    currentPage,
    hasNextPage,
    hasPrevPage,
  });

  // 페이지네이션 로깅
  console.log("[products/page] 페이지네이션 상태", {
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    category,
    sortBy,
  });

  // URL 쿼리 파라미터 생성 헬퍼 함수
  const buildUrlParams = (params: {
    page?: number;
    category?: string;
    sortBy?: SortOption;
  }): string => {
    const urlParams = new URLSearchParams();
    if (params.category) {
      urlParams.set("category", params.category);
    }
    if (params.sortBy && params.sortBy !== "latest") {
      urlParams.set("sortBy", params.sortBy);
    }
    if (params.page && params.page > 1) {
      urlParams.set("page", params.page.toString());
    }
    const queryString = urlParams.toString();
    return queryString ? `?${queryString}` : "";
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* 헤더 */}
          <div className="flex flex-col gap-2 sm:gap-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
              {category ? getCategoryLabel(category) : "전체 상품"}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              총 <span className="font-semibold">{totalCount}</span>개의 상품
            </p>
          </div>

          {/* 필터 영역 (카테고리 + 정렬) */}
          <div className="sticky top-20 z-10 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-end">
              {/* 카테고리 필터 */}
              <Suspense
                fallback={
                  <div className="flex gap-2 animate-pulse">
                    <div className="h-9 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  </div>
                }
              >
                <ProductCategoryFilter />
              </Suspense>

              {/* 정렬 필터 */}
              <Suspense
                fallback={
                  <div className="animate-pulse">
                    <div className="h-9 w-[180px] bg-gray-200 dark:bg-gray-800 rounded"></div>
                  </div>
                }
              >
                <ProductSortFilter />
              </Suspense>
            </div>
          </div>

          {/* 상품 목록 */}
          <div className="w-full">
            <ProductList
              products={products}
              emptyMessage={
                category
                  ? `${getCategoryLabel(category)} 카테고리에 상품이 없습니다.`
                  : "상품이 없습니다."
              }
            />
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <nav
              className="flex items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 flex-wrap"
              aria-label="페이지네이션"
            >
              {/* 이전 페이지 버튼 */}
              {hasPrevPage ? (
                <Link
                  href={`/products${buildUrlParams({
                    category,
                    sortBy,
                    page: currentPage - 1,
                  })}`}
                  aria-label={`이전 페이지 (${currentPage - 1}페이지)`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-[80px] sm:min-w-[100px]"
                  >
                    이전
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="min-w-[80px] sm:min-w-[100px]"
                  aria-label="이전 페이지 (사용 불가)"
                >
                  이전
                </Button>
              )}

              {/* 페이지 번호 */}
              <div className="flex items-center gap-1 sm:gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // 첫 페이지, 마지막 페이지, 현재 페이지 주변 ±PAGE_RANGE 범위만 표시
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - PAGE_RANGE &&
                        page <= currentPage + PAGE_RANGE)
                    );
                  })
                  .map((page, index, array) => {
                    // 연속되지 않는 경우 생략 표시 추가
                    const showEllipsis =
                      index > 0 && array[index - 1] !== page - 1;

                    return (
                      <div
                        key={page}
                        className="flex items-center gap-1 sm:gap-2"
                      >
                        {showEllipsis && (
                          <span
                            className="px-1 sm:px-2 text-gray-400 dark:text-gray-500 text-sm sm:text-base"
                            aria-hidden="true"
                          >
                            ...
                          </span>
                        )}
                        <Link
                          href={`/products${buildUrlParams({
                            category,
                            sortBy,
                            page,
                          })}`}
                          aria-label={`${page}페이지로 이동`}
                          aria-current={
                            currentPage === page ? "page" : undefined
                          }
                        >
                          <Button
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            className={`min-w-[40px] sm:min-w-[44px] ${
                              currentPage === page
                                ? "font-semibold shadow-sm"
                                : "hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                          >
                            {page}
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
              </div>

              {/* 다음 페이지 버튼 */}
              {hasNextPage ? (
                <Link
                  href={`/products${buildUrlParams({
                    category,
                    sortBy,
                    page: currentPage + 1,
                  })}`}
                  aria-label={`다음 페이지 (${currentPage + 1}페이지)`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-[80px] sm:min-w-[100px]"
                  >
                    다음
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="min-w-[80px] sm:min-w-[100px]"
                  aria-label="다음 페이지 (사용 불가)"
                >
                  다음
                </Button>
              )}
            </nav>
          )}
        </div>
      </div>
    </main>
  );
}
