import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

/**
 * @file page.tsx
 * @description 주문 성공 페이지
 *
 * 주문이 성공적으로 생성된 후 표시되는 페이지입니다.
 */

interface OrderSuccessPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderSuccessPage({
  params,
}: OrderSuccessPageProps) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    redirect("/sign-in");
  }

  console.log("[orders/[id]/success/page] 주문 성공 페이지 렌더링", {
    userId,
    orderId: id,
  });

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12 px-4">
          {/* 성공 아이콘 */}
          <div className="mb-6">
            <CheckCircle2 className="h-24 w-24 text-green-600" />
          </div>

          {/* 메시지 */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
            주문이 완료되었습니다
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2 text-center">
            주문 번호: {id}
          </p>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
            주문이 성공적으로 접수되었습니다. 주문 내역은 마이페이지에서 확인하실 수 있습니다.
          </p>

          {/* 버튼 */}
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/">홈으로 가기</Link>
            </Button>
            <Button asChild>
              <Link href="/my-page">주문 내역 보기</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

