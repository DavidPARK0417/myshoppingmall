import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { confirmPayment, updateOrderStatus } from "@/actions/payment";
import { formatPrice } from "@/lib/product-utils";

/**
 * @file page.tsx
 * @description 결제 성공 페이지
 *
 * Toss Payments 결제 승인 API를 호출하고, 주문 상태를 confirmed로 업데이트합니다.
 */

interface PaymentSuccessPageProps {
  searchParams: Promise<{
    paymentKey?: string;
    orderId?: string;
    amount?: string;
  }>;
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  // 로그인 확인
  const { userId } = await auth();

  if (!userId) {
    console.log(
      "[payment/success/page] 로그인하지 않은 사용자, 로그인 페이지로 리다이렉트",
    );
    redirect("/sign-in");
  }

  // 쿼리 파라미터 추출
  const params = await searchParams;
  const paymentKey = params.paymentKey;
  const orderId = params.orderId;
  const amountStr = params.amount;

  console.log("[payment/success/page] 결제 성공 페이지 렌더링", {
    userId,
    paymentKey,
    orderId,
    amount: amountStr,
  });

  // 필수 파라미터 확인
  if (!paymentKey || !orderId || !amountStr) {
    console.error("[payment/success/page] 필수 파라미터 누락", {
      paymentKey,
      orderId,
      amount: amountStr,
    });
    return (
      <main className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="w-full max-w-2xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <XCircle className="h-24 w-24 text-red-600 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
              결제 정보 오류
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
              결제 정보가 올바르지 않습니다. 결제 페이지로 다시 이동해주세요.
            </p>
            <Button asChild>
              <Link href="/cart">장바구니로 이동</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const amount = Number.parseInt(amountStr, 10);

  if (Number.isNaN(amount) || amount <= 0) {
    console.error("[payment/success/page] 금액 형식 오류", { amountStr });
    return (
      <main className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="w-full max-w-2xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <XCircle className="h-24 w-24 text-red-600 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
              결제 금액 오류
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
              결제 금액이 올바르지 않습니다. 결제 페이지로 다시 이동해주세요.
            </p>
            <Button asChild>
              <Link href={`/payment?orderId=${orderId}`}>
                결제 페이지로 이동
              </Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // 결제 승인 및 주문 상태 업데이트
  let paymentResult;
  let paymentError: string | null = null;

  try {
    console.log("[payment/success/page] 결제 승인 시작", {
      paymentKey,
      orderId,
      amount,
    });

    // 결제 승인 API 호출
    paymentResult = await confirmPayment(paymentKey, orderId, amount);

    console.log("[payment/success/page] 결제 승인 완료", {
      paymentKey: paymentResult.paymentKey,
      status: paymentResult.status,
      totalAmount: paymentResult.totalAmount,
    });

    // 금액 검증
    if (paymentResult.totalAmount !== amount) {
      console.error("[payment/success/page] 금액 불일치", {
        requestedAmount: amount,
        approvedAmount: paymentResult.totalAmount,
      });
      paymentError = "결제 금액이 일치하지 않습니다. 관리자에게 문의하세요.";
    } else {
      // 주문 상태를 confirmed로 업데이트
      await updateOrderStatus(orderId, "confirmed");
      console.log("[payment/success/page] 주문 상태 업데이트 완료", {
        orderId,
        status: "confirmed",
      });
    }
  } catch (error) {
    console.error("[payment/success/page] 결제 승인 오류:", error);
    paymentError =
      error instanceof Error
        ? error.message
        : "결제 승인 중 오류가 발생했습니다.";
  }

  if (paymentError) {
    return (
      <main className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="w-full max-w-2xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <XCircle className="h-24 w-24 text-red-600 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
              결제 승인 실패
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
              {paymentError}
            </p>
            <Button asChild>
              <Link href={`/payment?orderId=${orderId}`}>다시 시도</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // 결제 성공 UI
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
            결제가 완료되었습니다
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2 text-center">
            주문 번호: {orderId}
          </p>
          {paymentResult && (
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2 text-center">
              결제 금액: {formatPrice(paymentResult.totalAmount)}
            </p>
          )}
          <p className="text-base text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
            주문이 성공적으로 접수되었습니다. 주문 내역은 마이페이지에서
            확인하실 수 있습니다.
          </p>

          {/* 버튼 */}
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/">홈으로 가기</Link>
            </Button>
            <Button asChild>
              <Link href={`/orders/${orderId}/success`}>주문 상세 보기</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
