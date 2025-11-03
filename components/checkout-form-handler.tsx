"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ShippingAddressForm, {
  type ShippingAddressFormData,
} from "@/components/shipping-address-form";
import { createOrder } from "@/actions/orders";
import type { CartItem } from "@/types/cart";
import type { ShippingAddress } from "@/types/order";

/**
 * @file checkout-form-handler.tsx
 * @description 주문 폼 핸들러 컴포넌트
 *
 * 배송지 정보 폼을 관리하고 주문 생성을 처리하는 클라이언트 컴포넌트입니다.
 */

interface CheckoutFormHandlerProps {
  cartItems: CartItem[];
}

export default function CheckoutFormHandler({
  cartItems,
}: CheckoutFormHandlerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ShippingAddressFormData) => {
    setIsLoading(true);
    setError(null);

    console.log("[checkout-form-handler] 주문 생성 시작", {
      shippingAddress: data,
      cartItemCount: cartItems.length,
    });

    try {
      // ShippingAddress 형태로 변환
      const shippingAddress: ShippingAddress = {
        name: data.name,
        phone: data.phone,
        postcode: data.postcode,
        address: data.address,
        detailAddress: data.detailAddress || "",
      };

      // 주문 생성
      const order = await createOrder(shippingAddress, data.orderNote);

      console.log("[checkout-form-handler] 주문 생성 완료", {
        orderId: order.id,
        totalAmount: order.total_amount,
      });

      // 주문 완료 페이지로 이동 (Phase 4 결제 통합 전까지는 간단히 처리)
      // TODO: Phase 4에서 결제 페이지로 이동하도록 변경
      router.push(`/orders/${order.id}/success`);
    } catch (error) {
      console.error("[checkout-form-handler] 주문 생성 오류:", error);
      setError(
        error instanceof Error
          ? error.message
          : "주문 생성 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ShippingAddressForm onSubmit={handleSubmit} isLoading={isLoading} />

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/cart")}
          disabled={isLoading}
          className="flex-1"
        >
          장바구니로 돌아가기
        </Button>
        <Button
          type="submit"
          form="shipping-address-form"
          disabled={isLoading}
          className="flex-1"
          size="lg"
        >
          {isLoading ? "주문 처리 중..." : "주문하기"}
        </Button>
      </div>
    </div>
  );
}
