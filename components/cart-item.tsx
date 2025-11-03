"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CartItem } from "@/types/cart";
import { formatPrice } from "@/lib/product-utils";
import { Minus, Plus, Trash2 } from "lucide-react";
import { updateCartItemQuantity, removeFromCart } from "@/actions/cart";

/**
 * @file cart-item.tsx
 * @description 장바구니 아이템 컴포넌트
 *
 * 장바구니 페이지에서 개별 아이템을 표시하는 컴포넌트입니다.
 * 수량 변경 및 삭제 기능을 제공합니다.
 */

interface CartItemProps {
  item: CartItem;
}

export default function CartItemComponent({ item }: CartItemProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(item.quantity);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const maxQuantity = item.product.stock_quantity;
  const minQuantity = 1;
  const itemTotalPrice = item.product.price * quantity;

  const handleIncrease = () => {
    if (quantity < maxQuantity && !isPending) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      updateQuantity(newQuantity);
    }
  };

  const handleDecrease = () => {
    if (quantity > minQuantity && !isPending) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      updateQuantity(newQuantity);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= minQuantity && value <= maxQuantity) {
      setQuantity(value);
      updateQuantity(value);
    }
  };

  const updateQuantity = (newQuantity: number) => {
    startTransition(async () => {
      try {
        await updateCartItemQuantity(item.id, newQuantity);
        console.log("[cart-item] 수량 변경 완료", {
          cartItemId: item.id,
          newQuantity,
        });
        // 페이지 새로고침으로 최신 데이터 반영
        router.refresh();
      } catch (error) {
        console.error("[cart-item] 수량 변경 오류:", error);
        // 오류 발생 시 원래 수량으로 복원
        setQuantity(item.quantity);
        alert(
          error instanceof Error
            ? error.message
            : "수량 변경 중 오류가 발생했습니다.",
        );
      }
    });
  };

  const handleDelete = async () => {
    if (isDeleting || isPending) return;

    if (!confirm("정말 이 상품을 장바구니에서 삭제하시겠습니까?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await removeFromCart(item.id);
      console.log("[cart-item] 삭제 완료", { cartItemId: item.id });
      // 페이지 새로고침으로 최신 데이터 반영
      router.refresh();
    } catch (error) {
      console.error("[cart-item] 삭제 오류:", error);
      alert(
        error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
      {/* 상품 이미지 영역 (플레이스홀더) */}
      <div className="w-full sm:w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-gray-400 dark:text-gray-600 text-sm">
          이미지 준비중
        </span>
      </div>

      {/* 상품 정보 및 수량 조절 영역 */}
      <div className="flex-1 flex flex-col sm:flex-row gap-4">
        {/* 상품 정보 */}
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {item.product.name}
          </h3>
          <p className="text-base text-gray-700 dark:text-gray-300">
            {formatPrice(item.product.price)}
          </p>
          {item.product.stock_quantity < 10 && (
            <p className="text-sm text-orange-500 dark:text-orange-400">
              재고: {item.product.stock_quantity}개
            </p>
          )}
        </div>

        {/* 수량 조절 및 삭제 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* 수량 조절 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              수량
            </label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleDecrease}
                disabled={quantity <= minQuantity || isPending}
                aria-label="수량 감소"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min={minQuantity}
                max={maxQuantity}
                value={quantity}
                onChange={handleQuantityChange}
                disabled={isPending}
                className="text-center w-20"
                aria-label="수량 입력"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleIncrease}
                disabled={quantity >= maxQuantity || isPending}
                aria-label="수량 증가"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 아이템 총 가격 */}
          <div className="flex flex-col items-end space-y-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              합계
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatPrice(itemTotalPrice)}
            </p>
          </div>

          {/* 삭제 버튼 */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting || isPending}
            aria-label="장바구니에서 삭제"
            className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
