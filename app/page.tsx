import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { RiSupabaseFill } from "react-icons/ri";
import {
  getFeaturedProducts,
  getProductsByCategory,
  getProducts,
} from "@/actions/products";
import ProductList from "@/components/product-list";
import ProductCategoryFilter from "@/components/product-category-filter";
import { getCategoryLabel, getFeaturedCategories } from "@/lib/categories";

/**
 * @file page.tsx
 * @description 홈페이지
 *
 * 인기 상품 및 카테고리별 상품 섹션을 표시하는 홈페이지입니다.
 * Server Component로 구현하여 데이터를 서버에서 조회합니다.
 * URL 쿼리 파라미터를 통해 카테고리 필터링을 지원합니다.
 */

interface HomePageProps {
  searchParams: Promise<{
    category?: string;
    showAll?: string;
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const category = params.category || undefined;
  const showAll = params.showAll === "true"; // "전체" 버튼이 클릭되었는지 확인

  console.log("[home] 홈페이지 렌더링 시작", { category, showAll });

  // 카테고리가 선택되었거나 "전체" 버튼이 클릭된 경우에만 상품 조회
  const shouldShowProducts = category || showAll;

  // 병렬로 데이터 조회
  const [featuredProducts, allProducts, ...categoryProducts] =
    await Promise.all([
      getFeaturedProducts(8),
      shouldShowProducts
        ? getProducts({ category, limit: 12 })
        : Promise.resolve([]),
      ...getFeaturedCategories().map((category) =>
        getProductsByCategory(category, 4),
      ),
    ]);

  const categories = getFeaturedCategories();

  console.log("[home] 홈페이지 데이터 로드 완료", {
    featuredCount: featuredProducts.length,
    allProductsCount: allProducts.length,
    categoryCounts: categoryProducts.map((products, i) => ({
      category: categories[i],
      count: products.length,
    })),
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

        {/* 인기 상품 섹션 - 전체 상품 바로 위 */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl lg:text-3xl font-bold">인기 상품</h2>
            <Link href="/products">
              <Button variant="outline" size="sm">
                더보기
              </Button>
            </Link>
          </div>
          <ProductList products={featuredProducts} />
        </section>

        {/* 전체 상품 섹션 */}
        <section id="all-products" className="flex flex-col gap-6 scroll-mt-24">
          <h1 className="text-3xl font-bold mb-8">전체 상품</h1>

          {/* 카테고리 필터 */}
          <Suspense fallback={<div>필터 로딩 중...</div>}>
            <ProductCategoryFilter basePath="/" />
          </Suspense>

          {/* 필터링된 상품 목록 */}
          {shouldShowProducts ? (
            <ProductList
              products={allProducts}
              emptyMessage={
                category
                  ? `${getCategoryLabel(category)} 카테고리에 상품이 없습니다.`
                  : "상품이 없습니다."
              }
            />
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              카테고리를 선택하여 상품을 확인하세요.
            </div>
          )}
        </section>

        {/* 카테고리별 섹션 */}
        {categories.map((category, index) => {
          const products = categoryProducts[index];
          if (!products || products.length === 0) return null;

          return (
            <section key={category} className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl lg:text-3xl font-bold">
                  {getCategoryLabel(category)}
                </h2>
                <Link href={`/products?category=${category}`}>
                  <Button variant="outline" size="sm">
                    더보기
                  </Button>
                </Link>
              </div>
              <ProductList products={products} />
            </section>
          );
        })}

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
