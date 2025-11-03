import { notFound } from "next/navigation";
import { getProductById } from "@/actions/products";
import { getCategoryLabel } from "@/lib/categories";
import { formatPrice, getStockStatus, formatDate } from "@/lib/product-utils";
import ProductAddToCart from "@/components/product-add-to-cart";

/**
 * @file page.tsx
 * @description 상품 상세 페이지
 *
 * 개별 상품의 상세 정보를 표시하는 페이지입니다.
 * 상품명, 가격, 재고, 설명, 카테고리, 등록/수정일을 표시하며,
 * 우측 고정 영역에 장바구니 추가 UI를 제공합니다.
 *
 * 레이아웃:
 * - 상단: 이름, 가격, 재고 상태
 * - 중단: 설명, 카테고리
 * - 우측 고정: 장바구니 UI (수량 선택, 장바구니 추가 버튼)
 * - 하단: 등록일, 수정일
 */

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  console.log("[products/[id]/page] 상품 상세 페이지 렌더링", { id });

  const product = await getProductById(id);

  if (!product) {
    console.log("[products/[id]/page] 상품을 찾을 수 없음", { id });
    notFound();
  }

  const stockStatus = getStockStatus(product.stock_quantity);
  const isOutOfStock = product.stock_quantity === 0;

  console.log("[products/[id]/page] 상품 데이터 로드 완료", {
    id: product.id,
    name: product.name,
    price: product.price,
    stockQuantity: product.stock_quantity,
    category: product.category,
  });

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* 메인 콘텐츠 영역 (좌측 2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* 상단: 이름, 가격, 재고 */}
            <section className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {formatPrice(product.price)}
                </span>
                <span
                  className={`text-base sm:text-lg font-medium ${stockStatus.className}`}
                >
                  {stockStatus.text}
                </span>
              </div>
            </section>

            {/* 중단: 설명, 카테고리 */}
            <section className="space-y-6">
              {product.description && (
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    상품 설명
                  </h2>
                  <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {product.category && (
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    카테고리
                  </h2>
                  <span className="inline-block px-4 py-2 text-base rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {getCategoryLabel(product.category)}
                  </span>
                </div>
              )}
            </section>

            {/* 하단: 등록일, 수정일 */}
            <section className="pt-8 border-t border-gray-200 dark:border-gray-800">
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="font-medium">등록일:</span>
                  <span>{formatDate(product.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">수정일:</span>
                  <span>{formatDate(product.updated_at)}</span>
                </div>
              </div>
            </section>
          </div>

          {/* 우측 고정: 장바구니 UI */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <ProductAddToCart product={product} isOutOfStock={isOutOfStock} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
