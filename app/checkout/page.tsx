import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCartItems } from "@/actions/cart";
import CheckoutOrderSummary from "@/components/checkout-order-summary";
import ShippingAddressForm from "@/components/shipping-address-form";
import CheckoutFormHandler from "@/components/checkout-form-handler";

/**
 * @file page.tsx
 * @description 주문 페이지
 *
 * 사용자의 장바구니 상품을 확인하고, 배송지 정보를 입력받아 주문을 생성하는 페이지입니다.
 */

export default async function CheckoutPage() {
  // 로그인 확인
  const { userId } = await auth();

  if (!userId) {
    console.log(
      "[checkout/page] 로그인하지 않은 사용자, 로그인 페이지로 리다이렉트",
    );
    redirect("/sign-in");
  }

  console.log("[checkout/page] 주문 페이지 렌더링", { userId });

  // 장바구니 아이템 조회
  let cartItems;
  try {
    cartItems = await getCartItems();
    console.log("[checkout/page] 장바구니 아이템 조회 완료", {
      userId,
      itemCount: cartItems.length,
    });
  } catch (error) {
    console.error("[checkout/page] 장바구니 조회 오류:", error);
    cartItems = [];
  }

  // 빈 장바구니 처리
  if (cartItems.length === 0) {
    console.log(
      "[checkout/page] 장바구니가 비어있음, 장바구니 페이지로 리다이렉트",
    );
    redirect("/cart");
  }

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="w-full max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            주문하기
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            배송지 정보를 입력해주세요
          </p>
        </div>

        {/* 주문 페이지 내용 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 배송지 정보 입력 폼 */}
          <div className="lg:col-span-2">
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                배송지 정보
              </h2>
              <CheckoutFormHandler cartItems={cartItems} />
            </div>
          </div>

          {/* 주문 요약 (고정 영역) */}
          <div className="lg:col-span-1">
            <CheckoutOrderSummary cartItems={cartItems} />
          </div>
        </div>
      </div>
    </main>
  );
}
