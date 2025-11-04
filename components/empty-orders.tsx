import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

/**
 * @file empty-orders.tsx
 * @description 주문 내역이 없을 때 표시할 빈 상태 컴포넌트
 *
 * 마이페이지에서 주문 내역이 없을 때 표시되는 컴포넌트입니다.
 */

export default function EmptyOrders() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-6">
        <ShoppingBag className="h-24 w-24 text-gray-400 dark:text-gray-600" />
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2 text-center">
        주문 내역이 없습니다
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
        아직 주문한 상품이 없습니다. 쇼핑을 시작해보세요!
      </p>

      <Button asChild size="lg">
        <Link href="/">쇼핑하러 가기</Link>
      </Button>
    </div>
  );
}
