import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCartItems } from "@/actions/cart";
import CartItemComponent from "@/components/cart-item";
import CartSummary from "@/components/cart-summary";
import EmptyCart from "@/components/empty-cart";
import { formatPrice } from "@/lib/product-utils";

/**
 * @file page.tsx
 * @description 장바구니 페이지
 *
 * 사용자의 장바구니에 담긴 상품들을 표시하고, 수량 변경 및 삭제 기능을 제공합니다.
 * 주문 요약과 주문하기 버튼도 함께 표시됩니다.
 */

export default async function CartPage() {
  // 로그인 확인
  const { userId } = await auth();

  if (!userId) {
    console.log(
      "[cart/page] 로그인하지 않은 사용자, 로그인 페이지로 리다이렉트",
    );
    redirect("/sign-in");
  }

  console.log("[cart/page] 장바구니 페이지 렌더링", { userId });

  // 장바구니 아이템 조회
  let cartItems;
  try {
    cartItems = await getCartItems();
    console.log("[cart/page] 장바구니 아이템 조회 완료", {
      userId,
      itemCount: cartItems.length,
    });
  } catch (error) {
    console.error("[cart/page] 장바구니 조회 오류:", error);
    cartItems = [];
  }

  // 총 금액 계산
  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  // 빈 장바구니 처리
  if (cartItems.length === 0) {
    return (
      <main className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="w-full max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            장바구니
          </h1>
          <EmptyCart />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="w-full max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            장바구니
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            총 {cartItems.length}개의 상품이 담겨있습니다
          </p>
        </div>

        {/* 장바구니 내용 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 장바구니 아이템 목록 */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <CartItemComponent key={item.id} item={item} />
            ))}
          </div>

          {/* 주문 요약 (고정 영역) */}
          <div className="lg:col-span-1">
            <CartSummary
              totalAmount={totalAmount}
              itemCount={cartItems.length}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
