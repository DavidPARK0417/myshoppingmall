import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getOrderForPayment } from "@/actions/payment";
import PaymentWidget from "@/components/payment-widget";
import { formatPrice } from "@/lib/product-utils";

/**
 * @file page.tsx
 * @description 결제 페이지
 *
 * 사용자가 주문 정보를 확인하고 결제를 진행하는 페이지입니다.
 * Toss Payments v1 결제위젯을 사용하여 결제를 처리합니다.
 */

interface PaymentPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  // 로그인 확인
  const { userId } = await auth();

  if (!userId) {
    console.log(
      "[payment/page] 로그인하지 않은 사용자, 로그인 페이지로 리다이렉트",
    );
    redirect("/sign-in");
  }

  // 쿼리 파라미터에서 orderId 추출
  const params = await searchParams;
  const orderId = params.orderId;

  if (!orderId) {
    console.log("[payment/page] orderId가 없음, 장바구니 페이지로 리다이렉트");
    redirect("/cart");
  }

  console.log("[payment/page] 결제 페이지 렌더링", {
    userId,
    orderId,
  });

  // 주문 정보 조회
  let order;
  try {
    order = await getOrderForPayment(orderId);
    console.log("[payment/page] 주문 정보 조회 완료", {
      orderId: order.id,
      totalAmount: order.total_amount,
      status: order.status,
    });
  } catch (error) {
    console.error("[payment/page] 주문 조회 오류:", error);
    redirect("/cart");
  }

  // 환경 변수 확인
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  if (!clientKey) {
    console.error("[payment/page] NEXT_PUBLIC_TOSS_CLIENT_KEY가 설정되지 않음");
    return (
      <main className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="w-full max-w-4xl mx-auto">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
            <h1 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
              결제 설정 오류
            </h1>
            <p className="text-sm text-red-800 dark:text-red-200">
              결제 서비스가 설정되지 않았습니다. 관리자에게 문의하세요.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // customerKey는 Clerk user ID 사용
  const customerKey = userId;

  // 주문명 생성 (상품명 외 N건 형식)
  const orderName = `주문 #${order.id.slice(0, 8)}`;

  // 리다이렉트 URL 설정
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const successUrl = `${baseUrl}/payment/success`;
  const failUrl = `${baseUrl}/payment/fail`;

  // 배송지 정보
  const shippingAddress = order.shipping_address as {
    name: string;
    phone: string;
    address: string;
    detailAddress: string;
  } | null;

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="w-full max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            결제하기
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            주문 정보를 확인하고 결제를 진행해주세요
          </p>
        </div>

        {/* 주문 정보 요약 */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            주문 정보
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                주문 번호
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {order.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                결제 금액
              </span>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatPrice(order.total_amount)}
              </span>
            </div>
            {shippingAddress && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    배송지
                  </span>
                  <div className="mt-2 text-sm text-gray-900 dark:text-gray-100">
                    <p>{shippingAddress.name}</p>
                    <p>{shippingAddress.phone}</p>
                    <p>
                      {shippingAddress.address}
                      {shippingAddress.detailAddress &&
                        ` ${shippingAddress.detailAddress}`}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 결제위젯 */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
          <PaymentWidget
            clientKey={clientKey}
            customerKey={customerKey}
            orderId={order.id}
            orderName={orderName}
            amount={Number(order.total_amount)}
            successUrl={successUrl}
            failUrl={failUrl}
            customerEmail={shippingAddress?.name ? undefined : undefined}
            customerName={shippingAddress?.name}
            customerMobilePhone={shippingAddress?.phone}
          />
        </div>
      </div>
    </main>
  );
}
