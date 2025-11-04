import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getOrderById } from "@/actions/orders";
import OrderDetail from "@/components/order-detail";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * @file page.tsx
 * @description 주문 상세 페이지
 *
 * 특정 주문의 상세 정보를 표시하는 페이지입니다.
 * 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트됩니다.
 * 주문이 없거나 권한이 없으면 404 페이지를 표시합니다.
 */

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    console.log(
      "[my-page/orders/[id]] 로그인하지 않은 사용자, 로그인 페이지로 리다이렉트",
    );
    redirect("/sign-in");
  }

  console.log("[my-page/orders/[id]] 주문 상세 조회 시작", {
    userId,
    orderId: id,
  });

  let order;
  try {
    order = await getOrderById(id);
    console.log("[my-page/orders/[id]] 주문 상세 조회 완료", {
      userId,
      orderId: id,
      found: !!order,
    });
  } catch (error) {
    console.error("[my-page/orders/[id]] 주문 상세 조회 오류:", error);
    order = null;
  }

  if (!order) {
    console.log("[my-page/orders/[id]] 주문 없음, 404 페이지 표시", {
      userId,
      orderId: id,
    });
    notFound();
  }

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="w-full max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              주문 상세
            </h1>
            <Button asChild variant="outline">
              <Link href="/my-page">주문 목록으로</Link>
            </Button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            주문 정보를 확인하실 수 있습니다
          </p>
        </div>

        {/* 주문 상세 정보 */}
        <OrderDetail order={order} />
      </div>
    </main>
  );
}
