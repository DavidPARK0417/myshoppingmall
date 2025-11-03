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
 * 3열 레이아웃으로 구성되어 있습니다.
 *
 * 레이아웃:
 * - 왼쪽 열: 제품 이미지
 * - 중간 열: 제품 이름, 가격, 재고 표시, 카테고리, 상품 설명, 등록일, 수정일
 * - 오른쪽 열 (고정): 장바구니 UI (수량 선택, 장바구니 추가 버튼)
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
        {/* 3열 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* 왼쪽 열: 제품 이미지 */}
          <div className="w-full aspect-square relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {/* TODO: Supabase Storage 연동 시 실제 이미지 표시 */}
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-600 text-lg">
                이미지 준비중
              </span>
            </div>
          </div>

          {/* 중간 열: 제품 정보 */}
          <div className="space-y-6">
            {/* 제품 이름 */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100">
              {product.name}
            </h1>

            {/* 가격과 재고 상태 */}
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

            {/* 카테고리 */}
            {product.category && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  카테고리
                </h2>
                <span className="inline-block px-4 py-2 text-base rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {getCategoryLabel(product.category)}
                </span>
              </div>
            )}

            {/* 상품 설명 */}
            {product.description && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  상품 설명
                </h2>
                <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* 등록일 및 수정일 */}
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  등록일
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(product.created_at)}
                </p>
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  수정일
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(product.updated_at)}
                </p>
              </div>
            </div>
          </div>

          {/* 오른쪽 열 (고정): 장바구니 UI */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <ProductAddToCart product={product} isOutOfStock={isOutOfStock} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
