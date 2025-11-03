"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types/product";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { addToCart } from "@/actions/cart";
import ProductAddToCartDialog from "@/components/product-add-to-cart-dialog";

/**
 * @file product-add-to-cart.tsx
 * @description 상품 장바구니 추가 컴포넌트
 *
 * 상품 상세 페이지의 우측 고정 영역에 표시되는 장바구니 추가 UI입니다.
 * 수량 선택 및 장바구니 추가 기능을 제공합니다.
 */

interface ProductAddToCartProps {
  product: Product;
  isOutOfStock: boolean;
}

export default function ProductAddToCart({
  product,
  isOutOfStock,
}: ProductAddToCartProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const maxQuantity = product.stock_quantity;
  const minQuantity = 1;

  const handleIncrease = () => {
    if (quantity < maxQuantity && !isOutOfStock) {
      setQuantity((prev) => Math.min(prev + 1, maxQuantity));
      console.log("[product-add-to-cart] 수량 증가", {
        productId: product.id,
        quantity: quantity + 1,
        maxQuantity,
      });
    }
  };

  const handleDecrease = () => {
    if (quantity > minQuantity) {
      setQuantity((prev) => Math.max(prev - 1, minQuantity));
      console.log("[product-add-to-cart] 수량 감소", {
        productId: product.id,
        quantity: quantity - 1,
      });
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= minQuantity && value <= maxQuantity) {
      setQuantity(value);
      console.log("[product-add-to-cart] 수량 직접 입력", {
        productId: product.id,
        quantity: value,
      });
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock || isLoading) return;

    // 로그인 확인
    if (!isSignedIn) {
      console.log("[product-add-to-cart] 로그인 필요");
      router.push("/sign-in");
      return;
    }

    setIsLoading(true);
    console.log("[product-add-to-cart] 장바구니 추가 시작", {
      productId: product.id,
      quantity,
    });

    try {
      await addToCart(product.id, quantity);

      console.log("[product-add-to-cart] 장바구니 추가 성공", {
        productId: product.id,
        quantity,
      });

      // Dialog 표시
      setDialogOpen(true);
    } catch (error) {
      console.error("[product-add-to-cart] 장바구니 추가 오류:", error);
      alert(
        error instanceof Error
          ? error.message
          : "장바구니 추가 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  console.log("[product-add-to-cart] 컴포넌트 렌더링", {
    productId: product.id,
    quantity,
    isOutOfStock,
    maxQuantity,
    isSignedIn,
  });

  return (
    <div className="space-y-6 p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        구매하기
      </h2>

      {/* 수량 선택 */}
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
            disabled={quantity <= minQuantity}
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
            disabled={isOutOfStock}
            className="text-center w-20"
            aria-label="수량 입력"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleIncrease}
            disabled={quantity >= maxQuantity || isOutOfStock}
            aria-label="수량 증가"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {!isOutOfStock && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            최대 {maxQuantity}개까지 구매 가능합니다.
          </p>
        )}
      </div>

      {/* 총 가격 */}
      <div className="space-y-1 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            총 상품 금액
          </span>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {new Intl.NumberFormat("ko-KR", {
              style: "currency",
              currency: "KRW",
              maximumFractionDigits: 0,
            }).format(product.price * quantity)}
          </span>
        </div>
      </div>

      {/* 장바구니 추가 버튼 */}
      <Button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock || isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          "처리 중..."
        ) : isOutOfStock ? (
          "품절"
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            장바구니에 추가
          </>
        )}
      </Button>

      {isOutOfStock && (
        <p className="text-sm text-red-500 dark:text-red-400 text-center">
          현재 재고가 없어 구매할 수 없습니다.
        </p>
      )}

      {/* 장바구니 추가 완료 Dialog */}
      <ProductAddToCartDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        productName={product.name}
        quantity={quantity}
        totalPrice={product.price * quantity}
      />
    </div>
  );
}
