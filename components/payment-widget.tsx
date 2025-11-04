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
  const [isMounted, setIsMounted] = useState(false);
  const paymentMethodsRef = useRef<HTMLDivElement>(null);
  const agreementRef = useRef<HTMLDivElement>(null);

  // Hydration 오류 방지: 클라이언트에서만 마운트 상태 설정
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initPaymentWidget() {
      try {
        console.log("[payment-widget] 결제위젯 초기화 시작", {
          clientKey: clientKey ? `${clientKey.substring(0, 10)}...` : "없음",
          customerKey,
          orderId,
          amount,
        });

        setIsLoading(true);
        setError(null);

        // React 렌더링 사이클을 고려하여 DOM 요소가 준비될 때까지 대기
        // ref.current를 사용하여 React의 렌더링 사이클에 맞춰 확인
        const waitForDOM = () => {
          return new Promise<void>((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5초 (50 * 100ms)

            const checkDOM = () => {
              attempts++;

              // ref.current를 확인 (React 렌더링 후에 설정됨)
              const paymentMethodElement = paymentMethodsRef.current;
              const agreementElement = agreementRef.current;

              // 또는 document.getElementById로도 확인 (백업)
              const paymentMethodById =
                document.getElementById("payment-method");
              const agreementById = document.getElementById("agreement");

              if (
                (paymentMethodElement || paymentMethodById) &&
                (agreementElement || agreementById)
              ) {
                console.log("[payment-widget] DOM 요소 준비 완료", {
                  refCurrent: {
                    paymentMethod: !!paymentMethodElement,
                    agreement: !!agreementElement,
                  },
                  getElementById: {
                    paymentMethod: !!paymentMethodById,
                    agreement: !!agreementById,
                  },
                });
                resolve();
              } else if (attempts >= maxAttempts) {
                console.error("[payment-widget] DOM 요소 찾기 실패", {
                  attempts,
                  refCurrent: {
                    paymentMethod: !!paymentMethodElement,
                    agreement: !!agreementElement,
                  },
                  getElementById: {
                    paymentMethod: !!paymentMethodById,
                    agreement: !!agreementById,
                  },
                });
                reject(
                  new Error(
                    "DOM 요소를 찾을 수 없습니다. 컴포넌트가 렌더링되지 않았을 수 있습니다.",
                  ),
                );
              } else {
                console.log("[payment-widget] DOM 요소 대기 중...", {
                  attempt: attempts,
                  refCurrent: {
                    paymentMethod: !!paymentMethodElement,
                    agreement: !!agreementElement,
                  },
                  getElementById: {
                    paymentMethod: !!paymentMethodById,
                    agreement: !!agreementById,
                  },
                });
                setTimeout(checkDOM, 100);
              }
            };

            // 첫 번째 체크 전에 약간의 지연을 주어 React 렌더링이 완료될 시간을 제공
            setTimeout(checkDOM, 50);
          });
        };

        // DOM 준비 대기
        await waitForDOM();

        if (!mounted) return;

        // customerKey 형식 검증 및 변환
        // Toss Payments 요구사항: 영문 대소문자, 숫자, 특수문자 -, _, =, ., @ 를 최소 1개 이상 포함한 최소 2자 이상 최대 50자 이하
        let validCustomerKey = customerKey;
        // Clerk user ID는 보통 "user_xxxxx" 형식이므로 특수문자 검증이 필요할 수 있음
        // 안전하게 변환
        if (!/^[a-zA-Z0-9\-_=\.@]{2,50}$/.test(customerKey)) {
          // 허용된 특수문자만 유지
          validCustomerKey = customerKey.replace(/[^a-zA-Z0-9\-_=\.@]/g, "_");
          // 길이 보정
          if (validCustomerKey.length < 2) {
            validCustomerKey = `user_${customerKey.substring(0, 45)}`;
            validCustomerKey = validCustomerKey.replace(
              /[^a-zA-Z0-9\-_=\.@]/g,
              "_",
            );
          }
          if (validCustomerKey.length > 50) {
            validCustomerKey = validCustomerKey.substring(0, 50);
          }
          console.log("[payment-widget] customerKey 형식 변환", {
            original: customerKey,
            converted: validCustomerKey,
            length: validCustomerKey.length,
          });
        } else {
          console.log("[payment-widget] customerKey 형식 검증 통과", {
            customerKey,
            length: customerKey.length,
          });
        }

        // 결제위젯 SDK 로드 및 초기화
        console.log("[payment-widget] SDK 로드 시작");
        const widget = await loadPaymentWidget(clientKey, validCustomerKey);

        if (!mounted) return;

        console.log("[payment-widget] SDK 로드 완료, UI 렌더링 시작");

        // DOM 요소 존재 확인
        const paymentMethodElement = document.getElementById("payment-method");
        const agreementElement = document.getElementById("agreement");

        if (!paymentMethodElement) {
          throw new Error("결제 수단 UI 요소를 찾을 수 없습니다.");
        }

        if (!agreementElement) {
          throw new Error("이용약관 UI 요소를 찾을 수 없습니다.");
        }

        // 결제 UI 렌더링 (amount 포함)
        console.log("[payment-widget] renderPaymentMethods 호출 시작", {
          selector: "#payment-method",
          amount: { value: amount, currency: "KRW", country: "KR" },
          options: { variantKey: "DEFAULT" },
        });

        try {
          const paymentMethodsWidget = await widget.renderPaymentMethods(
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

          console.log("[payment-widget] renderPaymentMethods 성공", {
            widget: paymentMethodsWidget ? "정상" : "null",
          });

          // 렌더링 완료 후 DOM 확인
          setTimeout(() => {
            const renderedElement = document.querySelector("#payment-method");
            const hasContent =
              renderedElement?.children.length > 0 ||
              renderedElement?.innerHTML.trim() !== "";
            console.log("[payment-widget] 렌더링 후 DOM 확인", {
              elementExists: !!renderedElement,
              hasContent,
              innerHTML: renderedElement?.innerHTML.substring(0, 200),
            });
          }, 1000);
        } catch (renderError) {
          console.error(
            "[payment-widget] renderPaymentMethods 오류:",
            renderError,
          );
          throw new Error(
            `결제 수단 렌더링 실패: ${
              renderError instanceof Error
                ? renderError.message
                : String(renderError)
            }`,
          );
        }

        // 이용약관 UI 렌더링
        console.log("[payment-widget] renderAgreement 호출 시작");
        try {
          await widget.renderAgreement("#agreement", {
            variantKey: "AGREEMENT",
          });
          console.log("[payment-widget] renderAgreement 완료");
        } catch (agreementError) {
          console.error(
            "[payment-widget] renderAgreement 오류:",
            agreementError,
          );
          // 이용약관 렌더링 실패는 치명적이지 않으므로 경고만 표시
          console.warn(
            "[payment-widget] 이용약관 렌더링 실패, 결제는 계속 진행됩니다",
          );
        }

        setPaymentWidget(widget);

        console.log("[payment-widget] 결제위젯 초기화 완료");
      } catch (error) {
        console.error("[payment-widget] 결제위젯 초기화 오류:", error);
        console.error("[payment-widget] 에러 상세:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
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

  // Hydration 오류 방지: 서버와 클라이언트에서 동일한 초기 HTML 렌더링
  if (!isMounted) {
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
      </div>
    );
  }

  // 에러가 발생했고 위젯이 초기화되지 않은 경우
  if (error && !paymentWidget && !isLoading) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10 rounded-lg">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              결제위젯을 불러오는 중...
            </p>
          </div>
        </div>
      )}

      {/* 결제 수단 UI - 항상 렌더링하여 DOM 요소가 존재하도록 함 */}
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

      {/* 이용약관 UI - 항상 렌더링하여 DOM 요소가 존재하도록 함 */}
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
