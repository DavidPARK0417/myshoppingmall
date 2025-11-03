"use server";

import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type { TossPaymentResponse } from "@/types/payment";

/**
 * @file payment.ts
 * @description 결제 관련 Server Actions
 *
 * Toss Payments 결제 승인 API 호출 및 주문 상태 업데이트 기능을 제공합니다.
 * Clerk 인증을 통해 사용자 권한을 확인하고, service-role 클라이언트를 사용합니다.
 */

/**
 * Clerk 인증 확인 및 clerk_id 반환
 */
async function getAuthenticatedUserId(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    console.error("[payment] 인증되지 않은 사용자");
    throw new Error("인증이 필요합니다. 로그인 후 이용해주세요.");
  }

  return userId;
}

/**
 * 결제 승인 API 호출
 * @param paymentKey - Toss Payments 결제 키
 * @param orderId - 주문 번호
 * @param amount - 결제 금액
 * @returns 결제 승인 결과
 */
export async function confirmPayment(
  paymentKey: string,
  orderId: string,
  amount: number,
): Promise<TossPaymentResponse> {
  try {
    console.log("[payment] 결제 승인 시작", {
      paymentKey,
      orderId,
      amount,
    });

    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      console.error("[payment] TOSS_SECRET_KEY가 설정되지 않음");
      throw new Error("결제 서비스 설정 오류입니다. 관리자에게 문의하세요.");
    }

    // 시크릿 키를 Base64로 인코딩 (Basic 인증)
    const encodedSecret = Buffer.from(`${secretKey}:`).toString("base64");

    // 결제 승인 API 호출
    const response = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${encodedSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[payment] 결제 승인 API 오류:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(
        errorData.message || "결제 승인에 실패했습니다. 다시 시도해주세요.",
      );
    }

    const paymentData: TossPaymentResponse = await response.json();

    console.log("[payment] 결제 승인 완료", {
      paymentKey: paymentData.paymentKey,
      orderId: paymentData.orderId,
      status: paymentData.status,
      totalAmount: paymentData.totalAmount,
    });

    return paymentData;
  } catch (error) {
    console.error("[payment] confirmPayment 오류:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("결제 승인 중 오류가 발생했습니다.");
  }
}

/**
 * 주문 상태 업데이트
 * @param orderId - 주문 ID (UUID)
 * @param status - 새로운 주문 상태
 */
export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled",
): Promise<void> {
  try {
    const clerkId = await getAuthenticatedUserId();

    console.log("[payment] 주문 상태 업데이트 시작", {
      clerkId,
      orderId,
      status,
    });

    const supabase = getServiceRoleClient();

    // 주문 소유권 확인
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, clerk_id")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("[payment] 주문 조회 오류:", orderError);
      throw new Error("주문을 찾을 수 없습니다.");
    }

    if (order.clerk_id !== clerkId) {
      console.error("[payment] 주문 소유권 불일치", {
        orderClerkId: order.clerk_id,
        currentClerkId: clerkId,
      });
      throw new Error("주문 정보에 접근할 권한이 없습니다.");
    }

    // 주문 상태 업데이트
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (updateError) {
      console.error("[payment] 주문 상태 업데이트 오류:", updateError);
      throw new Error("주문 상태 업데이트에 실패했습니다.");
    }

    console.log("[payment] 주문 상태 업데이트 완료", {
      orderId,
      status,
    });
  } catch (error) {
    console.error("[payment] updateOrderStatus 오류:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("주문 상태 업데이트 중 오류가 발생했습니다.");
  }
}

/**
 * 주문 정보 조회 (결제 페이지용)
 * @param orderId - 주문 ID (UUID)
 * @returns 주문 정보
 */
export async function getOrderForPayment(orderId: string) {
  try {
    const clerkId = await getAuthenticatedUserId();

    console.log("[payment] 주문 정보 조회 시작", {
      clerkId,
      orderId,
    });

    const supabase = getServiceRoleClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, clerk_id, total_amount, status, shipping_address, order_note, created_at",
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("[payment] 주문 조회 오류:", orderError);
      throw new Error("주문을 찾을 수 없습니다.");
    }

    // 주문 소유권 확인
    if (order.clerk_id !== clerkId) {
      console.error("[payment] 주문 소유권 불일치", {
        orderClerkId: order.clerk_id,
        currentClerkId: clerkId,
      });
      throw new Error("주문 정보에 접근할 권한이 없습니다.");
    }

    // pending 상태가 아닌 주문은 결제 불가
    if (order.status !== "pending") {
      console.error("[payment] 주문 상태 오류", {
        orderId,
        status: order.status,
      });
      throw new Error(`이미 처리된 주문입니다. (현재 상태: ${order.status})`);
    }

    console.log("[payment] 주문 정보 조회 완료", {
      orderId: order.id,
      totalAmount: order.total_amount,
      status: order.status,
    });

    return order;
  } catch (error) {
    console.error("[payment] getOrderForPayment 오류:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("주문 정보 조회 중 오류가 발생했습니다.");
  }
}
