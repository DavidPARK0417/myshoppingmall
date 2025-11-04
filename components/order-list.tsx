import type { OrderWithItems } from "@/types/order";
import OrderCard from "@/components/order-card";

/**
 * @file order-list.tsx
 * @description 주문 목록 컴포넌트
 *
 * 마이페이지에서 주문 목록을 카드 형태로 표시하는 컴포넌트입니다.
 * 반응형 그리드 레이아웃을 사용합니다.
 */

interface OrderListProps {
  orders: OrderWithItems[];
}

export default function OrderList({ orders }: OrderListProps) {
  console.log("[order-list] 주문 목록 렌더링", {
    orderCount: orders.length,
  });

  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
