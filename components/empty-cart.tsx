import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

/**
 * @file empty-cart.tsx
 * @description 빈 장바구니 상태 컴포넌트
 *
 * 장바구니가 비어있을 때 표시되는 컴포넌트입니다.
 */

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-6">
        <ShoppingBag className="h-24 w-24 text-gray-300 dark:text-gray-700" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        장바구니가 비어있습니다
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
        원하는 상품을 장바구니에 추가해보세요.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/products">상품 둘러보기</Link>
        </Button>
        <Button asChild>
          <Link href="/">홈으로 가기</Link>
        </Button>
      </div>
    </div>
  );
}
