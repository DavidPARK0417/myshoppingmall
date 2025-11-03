"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/product-utils";
import { ShoppingCart, ArrowRight } from "lucide-react";

/**
 * @file product-add-to-cart-dialog.tsx
 * @description 장바구니 추가 완료 Dialog 컴포넌트
 *
 * 상품을 장바구니에 추가한 후 표시되는 Dialog입니다.
 * 사용자가 "장바구니로 이동" 또는 "계속 쇼핑"을 선택할 수 있습니다.
 */

interface ProductAddToCartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  quantity: number;
  totalPrice: number;
}

export default function ProductAddToCartDialog({
  open,
  onOpenChange,
  productName,
  quantity,
  totalPrice,
}: ProductAddToCartDialogProps) {
  const router = useRouter();

  const handleGoToCart = () => {
    onOpenChange(false);
    router.push("/cart");
  };

  const handleContinueShopping = () => {
    onOpenChange(false);
  };

  console.log("[product-add-to-cart-dialog] Dialog 렌더링", {
    open,
    productName,
    quantity,
    totalPrice,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-green-600" />
            장바구니에 추가되었습니다
          </DialogTitle>
          <DialogDescription>
            상품이 장바구니에 성공적으로 추가되었습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 상품 정보 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              상품명
            </p>
            <p className="text-base text-gray-700 dark:text-gray-300">
              {productName}
            </p>
          </div>

          {/* 수량 및 총 가격 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              수량
            </p>
            <p className="text-base text-gray-700 dark:text-gray-300">
              {quantity}개
            </p>
          </div>

          <div className="space-y-2 border-t border-gray-200 dark:border-gray-800 pt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                총 금액
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatPrice(totalPrice)}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleContinueShopping}
            className="w-full sm:w-auto"
          >
            계속 쇼핑
          </Button>
          <Button onClick={handleGoToCart} className="w-full sm:w-auto">
            장바구니로 이동
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
