import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { getUserOrders } from "@/actions/orders";
import OrderList from "@/components/order-list";
import EmptyOrders from "@/components/empty-orders";

/**
 * @file page.tsx
 * @description 마이페이지 (주문 목록)
 *
 * 사용자의 주문 내역을 조회하고 표시하는 페이지입니다.
 * 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트됩니다.
 */

async function OrdersContent() {
  const { userId } = await auth();

  if (!userId) {
    console.log("[my-page] 로그인하지 않은 사용자, 로그인 페이지로 리다이렉트");
    redirect("/sign-in");
  }

  console.log("[my-page] 주문 목록 조회 시작", { userId });

  let orders;
  try {
    orders = await getUserOrders();
    console.log("[my-page] 주문 목록 조회 완료", {
      userId,
      orderCount: orders.length,
    });
  } catch (error) {
    console.error("[my-page] 주문 목록 조회 오류:", error);
    orders = [];
  }

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="w-full max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            마이페이지
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            주문 내역을 확인하실 수 있습니다
          </p>
        </div>

        {/* 주문 목록 또는 빈 상태 */}
        {orders.length === 0 ? <EmptyOrders /> : <OrderList orders={orders} />}
      </div>
    </main>
  );
}

export default function MyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="w-full max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                마이페이지
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                주문 내역을 확인하실 수 있습니다
              </p>
            </div>
            <div className="flex items-center justify-center py-16">
              <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
            </div>
          </div>
        </main>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
