import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { RiSupabaseFill } from "react-icons/ri";
import { getProducts } from "@/actions/products";
import ProductList from "@/components/product-list";
import ProductCategoryFilter from "@/components/product-category-filter";
import ProductSortFilterHome from "@/components/product-sort-filter-home";
import { getCategoryLabel } from "@/lib/categories";
import { isValidSortOption, type SortOption } from "@/lib/sort";
import { getSortLabel } from "@/lib/sort";

/**
 * @file page.tsx
 * @description 홈페이지
 *
 * 4가지 정렬 기준(최신순, 인기순, 낮은 가격순, 높은 가격순)으로 상품을 표시하는 홈페이지입니다.
 * Server Component로 구현하여 데이터를 서버에서 조회합니다.
 * URL 쿼리 파라미터를 통해 카테고리 필터링 및 정렬을 지원합니다.
 */

interface HomePageProps {
  searchParams: Promise<{
    category?: string;
    showAll?: string;
    sortBy?: string;
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const category = params.category || undefined;
  const showAll = params.showAll === "true"; // "전체" 버튼이 클릭되었는지 확인

  // 정렬 파라미터 파싱 및 검증
  const sortByParam = params.sortBy;
  const selectedSort: SortOption | null = isValidSortOption(sortByParam)
    ? sortByParam
    : null;

  console.log("[home] 홈페이지 렌더링 시작", {
    category,
    showAll,
    selectedSort,
  });

  // 카테고리가 선택되었거나 "전체" 버튼이 클릭된 경우에만 상품 조회
  const shouldShowProducts = category || showAll;

  // 4가지 정렬 섹션용 상품 데이터 조회
  const sortSections: Array<{ sortBy: SortOption; label: string }> = [
    { sortBy: "latest", label: "최신 상품" },
    { sortBy: "popular", label: "인기 상품" },
    { sortBy: "price-asc", label: "낮은 가격순" },
    { sortBy: "price-desc", label: "높은 가격순" },
  ];

  // 정렬이 선택되지 않은 경우: 4가지 정렬 섹션 모두 조회
  // 정렬이 선택된 경우: 선택한 정렬로만 1개 섹션 조회
  const shouldShowAllSortSections = !selectedSort && !shouldShowProducts;

  const [sortedProducts, filteredProducts, singleSortProducts] =
    await Promise.all([
      // 정렬이 선택되지 않고 카테고리도 선택되지 않은 경우: 4가지 정렬 섹션 데이터 조회
      shouldShowAllSortSections
        ? Promise.all(
            sortSections.map((section) =>
              getProducts({ sortBy: section.sortBy, limit: 4 }),
            ),
          )
        : Promise.resolve([]),
      // 카테고리가 선택된 경우: 필터링된 상품 조회
      shouldShowProducts
        ? getProducts({ category, sortBy: selectedSort || "latest", limit: 12 })
        : Promise.resolve([]),
      // 정렬이 선택되고 카테고리가 선택되지 않은 경우: 선택한 정렬로 모든 상품 조회
      selectedSort && !shouldShowProducts
        ? getProducts({ sortBy: selectedSort, limit: 1000 })
        : Promise.resolve([]),
    ]);

  console.log("[home] 홈페이지 데이터 로드 완료", {
    sortedProductsCount: sortedProducts.map((p) => p.length),
    filteredProductsCount: filteredProducts.length,
    singleSortProductsCount: singleSortProducts.length,
    shouldShowProducts,
    category,
    selectedSort,
    shouldShowAllSortSections,
  });

  return (
    <main className="min-h-[calc(100vh-80px)] px-8 py-16 lg:py-24">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-16">
        {/* 히어로 섹션 */}
        <section className="text-center py-8">
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-4">
            쇼핑몰에 오신 것을 환영합니다
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400">
            최신 상품을 만나보세요
          </p>
        </section>

        {/* 카테고리 및 정렬 필터 */}
        <section id="all-products" className="flex flex-col gap-6 scroll-mt-24">
          <h1 className="text-3xl font-bold mb-4">전체 상품</h1>

          {/* 카테고리 필터 */}
          <Suspense fallback={<div>필터 로딩 중...</div>}>
            <ProductCategoryFilter basePath="/" />
          </Suspense>

          {/* 정렬 필터 (카테고리 필터 아래) */}
          <Suspense fallback={<div>필터 로딩 중...</div>}>
            <ProductSortFilterHome basePath="/" />
          </Suspense>
        </section>

        {/* 정렬이 선택되지 않고 카테고리도 선택되지 않은 경우: 4가지 정렬 섹션 모두 표시 */}
        {shouldShowAllSortSections && (
          <>
            {sortSections.map((section, index) => {
              const products = sortedProducts[index] || [];
              if (products.length === 0) return null;

              return (
                <section key={section.sortBy} className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl lg:text-3xl font-bold">
                      {section.label}
                    </h2>
                    <Link href={`/products?sortBy=${section.sortBy}`}>
                      <Button variant="outline" size="sm">
                        더보기
                      </Button>
                    </Link>
                  </div>
                  <ProductList products={products} />
                </section>
              );
            })}
          </>
        )}

        {/* 정렬이 선택되고 카테고리는 선택되지 않은 경우: 선택한 정렬로만 1개 섹션 표시 */}
        {selectedSort &&
          !shouldShowProducts &&
          singleSortProducts.length > 0 && (
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl lg:text-3xl font-bold">
                  {getSortLabel(selectedSort)}
                </h2>
                <Link href={`/products?sortBy=${selectedSort}`}>
                  <Button variant="outline" size="sm">
                    더보기
                  </Button>
                </Link>
              </div>
              <ProductList products={singleSortProducts} />
            </section>
          )}

        {/* 카테고리가 선택된 경우: 필터링된 상품 목록 표시 (정렬 적용) */}
        {shouldShowProducts && (
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl lg:text-3xl font-bold">
                {category
                  ? `${getCategoryLabel(category)} 카테고리${
                      selectedSort ? ` - ${getSortLabel(selectedSort)}` : ""
                    }`
                  : "전체 상품"}
              </h2>
              <Link
                href={`/products${category ? `?category=${category}` : ""}${
                  selectedSort
                    ? `${category ? "&" : "?"}sortBy=${selectedSort}`
                    : ""
                }`}
              >
                <Button variant="outline" size="sm">
                  더보기
                </Button>
              </Link>
            </div>
            <ProductList
              products={filteredProducts}
              emptyMessage={
                category
                  ? `${getCategoryLabel(category)} 카테고리에 상품이 없습니다.`
                  : "상품이 없습니다."
              }
            />
          </section>
        )}

        {/* 테스트 페이지 섹션 (하단으로 이동) */}
        <section className="border-t pt-16 mt-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            개발 테스트 페이지
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link href="/storage-test" className="w-full">
              <Button className="w-full h-20 flex items-center justify-center gap-4 text-lg shadow-lg hover:shadow-xl transition-shadow">
                <RiSupabaseFill className="w-6 h-6" />
                <span>Storage 파일 업로드 테스트</span>
              </Button>
            </Link>
            <Link href="/auth-test" className="w-full">
              <Button
                className="w-full h-20 flex items-center justify-center gap-4 text-lg shadow-lg hover:shadow-xl transition-shadow"
                variant="outline"
              >
                <RiSupabaseFill className="w-6 h-6" />
                <span>Clerk + Supabase 인증 연동</span>
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
