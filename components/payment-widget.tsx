"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadPaymentWidget,
  type PaymentWidgetInstance,
} from "@tosspayments/payment-widget-sdk";

/**
 * @file payment-widget.tsx
 * @description Toss Payments 결제위젯 컴포넌트
 *
 * Toss Payments v1 결제위젯 SDK를 사용하여 결제를 처리하는 클라이언트 컴포넌트입니다.
 */

interface PaymentWidgetProps {
  clientKey: string;
  customerKey: string;
  orderId: string;
  orderName: string;
  amount: number;
  successUrl: string;
  failUrl: string;
  customerEmail?: string;
  customerName?: string;
  customerMobilePhone?: string;
}

export default function PaymentWidget({
  clientKey,
  customerKey,
  orderId,
  orderName,
  amount,
  successUrl,
  failUrl,
  customerEmail,
  customerName,
  customerMobilePhone,
}: PaymentWidgetProps) {
  const [paymentWidget, setPaymentWidget] =
    useState<PaymentWidgetInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const paymentMethodsRef = useRef<HTMLDivElement>(null);
  const agreementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    async function initPaymentWidget() {
      try {
        console.log("[payment-widget] 결제위젯 초기화 시작", {
          clientKey,
          customerKey,
          orderId,
          amount,
        });

        setIsLoading(true);
        setError(null);

        // 결제위젯 SDK 로드 및 초기화
        const widget = await loadPaymentWidget(clientKey, customerKey);

        if (!mounted) return;

        // 결제 UI 렌더링 (amount 포함)
        if (paymentMethodsRef.current) {
          await widget.renderPaymentMethods(
            "#payment-method",
            {
              value: amount,
              currency: "KRW",
              country: "KR",
            },
            {
              variantKey: "DEFAULT",
            },
          );
        }

        // 이용약관 UI 렌더링
        if (agreementRef.current) {
          await widget.renderAgreement("#agreement", {
            variantKey: "AGREEMENT",
          });
        }

        setPaymentWidget(widget);

        console.log("[payment-widget] 결제위젯 초기화 완료");
      } catch (error) {
        console.error("[payment-widget] 결제위젯 초기화 오류:", error);
        if (mounted) {
          setError(
            error instanceof Error
              ? error.message
              : "결제위젯을 초기화하는 중 오류가 발생했습니다.",
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initPaymentWidget();

    return () => {
      mounted = false;
    };
  }, [clientKey, customerKey, orderId, amount]);

  const handlePayment = async () => {
    if (!paymentWidget) {
      setError("결제위젯이 아직 초기화되지 않았습니다.");
      return;
    }

    try {
      console.log("[payment-widget] 결제 요청 시작", {
        orderId,
        orderName,
        amount,
      });

      setError(null);

      // 결제 요청
      await paymentWidget.requestPayment({
        orderId,
        orderName,
        successUrl,
        failUrl,
        customerEmail,
        customerName,
        customerMobilePhone,
      });

      console.log("[payment-widget] 결제 요청 완료");
    } catch (error) {
      console.error("[payment-widget] 결제 요청 오류:", error);

      // 사용자가 결제창을 닫은 경우는 에러로 표시하지 않음
      if (error && typeof error === "object" && "code" in error) {
        const errorCode = error.code as string;
        if (errorCode === "USER_CANCEL") {
          console.log("[payment-widget] 사용자가 결제를 취소함");
          return;
        }
      }

      setError(
        error instanceof Error
          ? error.message
          : "결제 요청 중 오류가 발생했습니다.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            결제위젯을 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (error && !paymentWidget) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 결제 수단 UI */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          결제 수단
        </h3>
        <div
          id="payment-method"
          ref={paymentMethodsRef}
          className="min-h-[200px] rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        />
      </div>

      {/* 이용약관 UI */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          이용약관
        </h3>
        <div
          id="agreement"
          ref={agreementRef}
          className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        />
      </div>

      {/* 결제하기 버튼 */}
      <button
        onClick={handlePayment}
        disabled={!paymentWidget || isLoading}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        결제하기
      </button>

      {/* 에러 메시지 */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* 테스트 안내 */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <h4 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
          테스트 결제 안내
        </h4>
        <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
          <li>• 카드번호: 4111-1111-1111-1111</li>
          <li>• 유효기간: 12/34 (임의의 미래 날짜)</li>
          <li>• CVC: 123 (임의의 3자리 숫자)</li>
          <li>• 비밀번호: 123456 (6자리 비밀번호)</li>
        </ul>
      </div>
    </div>
  );
}
