"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { getCartItemsCount } from "@/actions/cart";

/**
 * @file cart-icon-button.tsx
 * @description GNB 장바구니 아이콘 버튼 컴포넌트
 *
 * 화면 최상단 GNB에 표시되는 장바구니 아이콘입니다.
 * 장바구니 아이템 개수를 뱃지로 표시하고, 클릭 시 장바구니 페이지로 이동합니다.
 */

export default function CartIconButton() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [itemCount, setItemCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 장바구니 아이템 개수 조회
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setItemCount(null);
      return;
    }

    const fetchCartCount = async () => {
      try {
        setIsLoading(true);
        const count = await getCartItemsCount();
        setItemCount(count);
        console.log("[cart-icon-button] 장바구니 개수 조회 완료", { count });
      } catch (error) {
        console.error("[cart-icon-button] 장바구니 개수 조회 오류:", error);
        setItemCount(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartCount();
  }, [isSignedIn, isLoaded]);

  const handleClick = () => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    router.push("/cart");
  };

  // 로그인하지 않은 경우 또는 로딩 중인 경우에도 아이콘은 표시 (클릭 시 로그인 유도)
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className="relative"
      aria-label="장바구니"
    >
      <ShoppingCart className="h-5 w-5" />
      {isSignedIn && itemCount !== null && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Button>
  );
}
