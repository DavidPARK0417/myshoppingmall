/**
 * @file payment.ts
 * @description Toss Payments 관련 타입 정의
 *
 * 결제 위젯 및 결제 API 응답 타입을 정의합니다.
 */

/**
 * Toss Payments 결제 승인 API 응답 타입 (일부 필드만 정의)
 */
export interface TossPaymentResponse {
  mId: string;
  version: string;
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: "DONE" | "CANCELED" | "PARTIAL_CANCELED" | "ABORTED" | "EXPIRED";
  requestedAt: string;
  approvedAt: string | null;
  card: TossCardInfo | null;
  virtualAccount: TossVirtualAccount | null;
  transfer: TossTransfer | null;
  mobilePhone: TossMobilePhone | null;
  easyPay: TossEasyPay | null;
  currency: string;
  totalAmount: number;
  balanceAmount: number;
  method: string;
  failure?: TossFailure;
}

/**
 * 카드 결제 정보
 */
export interface TossCardInfo {
  issuerCode: string;
  acquirerCode: string;
  number: string;
  installmentPlanMonths: number;
  isInterestFree: boolean;
  approveNo: string;
  useCardPoint: boolean;
  cardType: string;
  ownerType: string;
  acquireStatus: string;
  amount: number;
}

/**
 * 가상계좌 정보
 */
export interface TossVirtualAccount {
  accountType: string;
  accountNumber: string;
  bankCode: string;
  customerName: string;
  dueDate: string;
  refundReceiveAccount: TossRefundReceiveAccount | null;
}

/**
 * 계좌이체 정보
 */
export interface TossTransfer {
  bankCode: string;
  settlementStatus: string;
}

/**
 * 휴대폰 결제 정보
 */
export interface TossMobilePhone {
  carrier: string;
  customerMobilePhone: string;
  settlementStatus: string;
  receiptUrl: string;
}

/**
 * 간편결제 정보
 */
export interface TossEasyPay {
  provider: string;
  amount: number;
  discountAmount: number;
}

/**
 * 환불 계좌 정보
 */
export interface TossRefundReceiveAccount {
  bank: string;
  accountNumber: string;
  holderName: string;
}

/**
 * 결제 실패 정보
 */
export interface TossFailure {
  code: string;
  message: string;
}

/**
 * 결제 성공 페이지 props
 */
export interface PaymentSuccessPageProps {
  searchParams: Promise<{
    paymentKey?: string;
    orderId?: string;
    amount?: string;
  }>;
}

/**
 * 결제 실패 페이지 props
 */
export interface PaymentFailPageProps {
  searchParams: Promise<{
    code?: string;
    message?: string;
    paymentKey?: string;
    orderId?: string;
    amount?: string;
  }>;
}
