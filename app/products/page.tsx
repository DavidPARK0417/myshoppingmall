import { Suspense } from "react";
import { getProducts, getProductsCount } from "@/actions/products";
import ProductList from "@/components/product-list";
import ProductCategoryFilter from "@/components/product-category-filter";
import { getCategoryLabel } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * @file page.tsx
 * @description 상품 목록 페이지
 *
 * 전체 상품 목록 또는 카테고리별 상품 목록을 표시하는 페이지입니다.
 * 페이지네이션과 카테고리 필터링을 지원합니다.
 */

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 12;

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category || undefined;
  const currentPage = parseInt(params.page || "1", 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  console.log("[products/page] 상품 목록 페이지 렌더링", {
    category,
    currentPage,
    offset,
  });

  // 병렬로 데이터 조회
  const [products, totalCount] = await Promise.all([
    getProducts({
      category,
      limit: ITEMS_PER_PAGE,
      offset,
    }),
    getProductsCount(category),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  console.log("[products/page] 데이터 로드 완료", {
    productCount: products.length,
    totalCount,
    totalPages,
    currentPage,
  });

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

          {/* 카테고리 필터 */}
          <div className="sticky top-20 z-10 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <Suspense
              fallback={
                <div className="flex gap-2 animate-pulse">
                  <div className="h-9 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              }
            >
              <ProductCategoryFilter />
            </Suspense>
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
            <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6 sm:mt-8 flex-wrap">
              {/* 이전 페이지 */}
              {hasPrevPage ? (
                <Link
                  href={`/products?${
                    category ? `category=${category}&` : ""
                  }page=${currentPage - 1}`}
                >
                  <Button variant="outline" size="sm">
                    이전
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  이전
                </Button>
              )}

              {/* 페이지 번호 */}
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // 현재 페이지 주변 2페이지만 표시
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    );
                  })
                  .map((page, index, array) => {
                    // 생략 표시 추가
                    const showEllipsis =
                      index > 0 && array[index - 1] !== page - 1;

                    return (
                      <div key={page} className="flex items-center gap-2">
                        {showEllipsis && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <Link
                          href={`/products?${
                            category ? `category=${category}&` : ""
                          }page=${page}`}
                        >
                          <Button
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            className={
                              currentPage === page ? "font-semibold" : ""
                            }
                          >
                            {page}
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
              </div>

              {/* 다음 페이지 */}
              {hasNextPage ? (
                <Link
                  href={`/products?${
                    category ? `category=${category}&` : ""
                  }page=${currentPage + 1}`}
                >
                  <Button variant="outline" size="sm">
                    다음
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  다음
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
