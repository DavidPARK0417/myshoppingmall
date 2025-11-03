import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

/**
 * @file page.tsx
 * @description 결제 실패 페이지
 *
 * 결제 실패 시 사용자에게 에러 메시지를 표시하고 재시도 옵션을 제공합니다.
 */

interface PaymentFailPageProps {
  searchParams: Promise<{
    code?: string;
    message?: string;
    paymentKey?: string;
    orderId?: string;
    amount?: string;
  }>;
}

export default async function PaymentFailPage({
  searchParams,
}: PaymentFailPageProps) {
  // 로그인 확인
  const { userId } = await auth();

  if (!userId) {
    console.log(
      "[payment/fail/page] 로그인하지 않은 사용자, 로그인 페이지로 리다이렉트",
    );
    redirect("/sign-in");
  }

  // 쿼리 파라미터 추출
  const params = await searchParams;
  const errorCode = params.code;
  const errorMessage = params.message;
  const orderId = params.orderId;

  console.log("[payment/fail/page] 결제 실패 페이지 렌더링", {
    userId,
    errorCode,
    errorMessage,
    orderId,
  });

  // 사용자 친화적인 에러 메시지 생성
  const getErrorMessage = () => {
    if (errorMessage) {
      return errorMessage;
    }

    switch (errorCode) {
      case "USER_CANCEL":
        return "결제가 취소되었습니다.";
      case "INVALID_CARD_EXPIRATION":
        return "카드 유효기간이 올바르지 않습니다.";
      case "INVALID_CARD_NUMBER":
        return "카드 번호가 올바르지 않습니다.";
      case "INSUFFICIENT_FUNDS":
        return "카드 잔액이 부족합니다.";
      default:
        return "결제 중 오류가 발생했습니다. 다시 시도해주세요.";
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12 px-4">
          {/* 에러 아이콘 */}
          <div className="mb-6">
            <XCircle className="h-24 w-24 text-red-600" />
          </div>

          {/* 메시지 */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
            결제에 실패했습니다
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-2 text-center max-w-md">
            {getErrorMessage()}
          </p>
          {errorCode && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-8 text-center">
              오류 코드: {errorCode}
            </p>
          )}

          {/* 버튼 */}
          <div className="flex gap-4">
            {orderId ? (
              <Button asChild>
                <Link href={`/payment?orderId=${orderId}`}>다시 시도</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/cart">장바구니로 돌아가기</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/">홈으로 가기</Link>
            </Button>
          </div>

          {/* 도움말 */}
          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20 max-w-md">
            <h3 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
              결제 문제가 계속되나요?
            </h3>
            <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
              <li>• 카드 정보를 다시 확인해주세요</li>
              <li>• 다른 결제 수단을 시도해보세요</li>
              <li>• 문제가 계속되면 고객센터로 문의해주세요</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
