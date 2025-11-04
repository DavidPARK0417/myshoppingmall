"use server";

import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { getCartItems, clearCart } from "@/actions/cart";
import type {
  ShippingAddress,
  Order,
  OrderItem,
  OrderWithItems,
} from "@/types/order";

/**
 * @file orders.ts
 * @description 주문 관련 Server Actions
 *
 * 주문 생성 및 조회 기능을 제공합니다.
 * Clerk 인증을 통해 사용자 권한을 확인하고, service-role 클라이언트를 사용합니다.
 */

/**
 * Clerk 인증 확인 및 clerk_id 반환
 */
async function getAuthenticatedUserId(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    console.error("[orders] 인증되지 않은 사용자");
    throw new Error("인증이 필요합니다. 로그인 후 이용해주세요.");
  }

  return userId;
}

/**
 * 주문 생성
 * @param shippingAddress - 배송지 정보
 * @param orderNote - 주문 메모 (선택사항)
 * @returns 생성된 주문 정보
 */
export async function createOrder(
  shippingAddress: ShippingAddress,
  orderNote?: string,
): Promise<OrderWithItems> {
  try {
    const clerkId = await getAuthenticatedUserId();

    console.log("[orders] 주문 생성 시작", {
      clerkId,
      shippingAddress,
      orderNote,
    });

    const supabase = getServiceRoleClient();

    // 1. 장바구니 아이템 조회
    const cartItems = await getCartItems();
    if (cartItems.length === 0) {
      throw new Error("장바구니가 비어있습니다.");
    }

    console.log("[orders] 장바구니 아이템 조회 완료", {
      itemCount: cartItems.length,
    });

    // 2. 재고 확인 및 총 금액 계산
    let totalAmount = 0;
    const stockCheckPromises = cartItems.map(async (cartItem) => {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", cartItem.product_id)
        .eq("is_active", true)
        .single();

      if (productError || !product) {
        throw new Error(`상품을 찾을 수 없습니다: ${cartItem.product.name}`);
      }

      if (product.stock_quantity < cartItem.quantity) {
        throw new Error(
          `${cartItem.product.name}의 재고가 부족합니다. (재고: ${product.stock_quantity}개, 요청: ${cartItem.quantity}개)`,
        );
      }

      totalAmount += product.price * cartItem.quantity;
      return { cartItem, product };
    });

    const stockChecks = await Promise.all(stockCheckPromises);

    console.log("[orders] 재고 확인 및 총 금액 계산 완료", {
      totalAmount,
    });

    // 3. 트랜잭션 시작 (Supabase는 트랜잭션을 직접 지원하지 않으므로 순차 실행)
    // 3-1. 주문 생성
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        clerk_id: clerkId,
        total_amount: totalAmount,
        status: "pending",
        shipping_address: shippingAddress as any, // JSONB
        order_note: orderNote || null,
      })
      .select()
      .single();

    if (orderError || !newOrder) {
      console.error("[orders] 주문 생성 오류:", orderError);
      throw new Error("주문 생성 실패");
    }

    console.log("[orders] 주문 생성 완료", {
      orderId: newOrder.id,
    });

    // 3-2. 주문 상세 아이템 생성
    const orderItemsData = stockChecks.map(({ cartItem, product }) => ({
      order_id: newOrder.id,
      product_id: product.id,
      product_name: product.name,
      quantity: cartItem.quantity,
      price: product.price,
    }));

    const { data: orderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItemsData)
      .select();

    if (orderItemsError || !orderItems) {
      console.error("[orders] 주문 상세 생성 오류:", orderItemsError);
      // 주문 상세 생성 실패 시 주문 롤백
      try {
        await supabase.from("orders").delete().eq("id", newOrder.id);
        console.log("[orders] 주문 롤백 완료 (주문 상세 생성 실패)", {
          orderId: newOrder.id,
        });
      } catch (rollbackError) {
        console.error("[orders] 주문 롤백 오류:", rollbackError);
      }
      throw new Error("주문 상세 생성 실패");
    }

    console.log("[orders] 주문 상세 생성 완료", {
      orderId: newOrder.id,
      itemCount: orderItems.length,
    });

    // 3-3. 재고 감소
    const stockUpdatePromises = stockChecks.map(
      async ({ cartItem, product }) => {
        const newStock = product.stock_quantity - cartItem.quantity;
        const { error: updateError } = await supabase
          .from("products")
          .update({ stock_quantity: newStock })
          .eq("id", product.id);

        if (updateError) {
          console.error("[orders] 재고 업데이트 오류:", updateError);
          throw new Error(`재고 업데이트 실패: ${product.name}`);
        }

        console.log("[orders] 재고 업데이트 완료", {
          productId: product.id,
          productName: product.name,
          previousStock: product.stock_quantity,
          newStock,
          quantity: cartItem.quantity,
        });
      },
    );

    await Promise.all(stockUpdatePromises);

    console.log("[orders] 재고 감소 완료", {
      itemCount: stockChecks.length,
    });

    // 3-4. 장바구니 비우기
    await clearCart();

    console.log("[orders] 장바구니 비우기 완료");

    // 4. 주문 정보 반환
    const orderWithItems: OrderWithItems = {
      ...(newOrder as Order),
      order_items: orderItems as OrderItem[],
    };

    console.log("[orders] 주문 생성 완료", {
      orderId: orderWithItems.id,
      totalAmount: orderWithItems.total_amount,
      itemCount: orderWithItems.order_items.length,
    });

    return orderWithItems;
  } catch (error) {
    console.error("[orders] createOrder 오류:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("주문 생성 중 오류가 발생했습니다.");
  }
}

/**
 * 현재 로그인한 사용자의 주문 목록 조회
 * @returns 주문 목록 (주문 상세 아이템 포함)
 */
export async function getUserOrders(): Promise<OrderWithItems[]> {
  try {
    const clerkId = await getAuthenticatedUserId();

    console.log("[orders] 사용자 주문 목록 조회 시작", { clerkId });

    const supabase = getServiceRoleClient();

    // 1. 주문 목록 조회
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("clerk_id", clerkId)
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("[orders] 주문 목록 조회 오류:", ordersError);
      throw new Error("주문 목록 조회 실패");
    }

    if (!orders || orders.length === 0) {
      console.log("[orders] 주문 목록 없음", { clerkId });
      return [];
    }

    console.log("[orders] 주문 목록 조회 완료", {
      clerkId,
      orderCount: orders.length,
    });

    // 2. 각 주문의 상세 아이템 조회
    const ordersWithItemsPromises = orders.map(async (order) => {
      const { data: orderItems, error: orderItemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at", { ascending: true });

      if (orderItemsError) {
        console.error(
          `[orders] 주문 상세 조회 오류 (orderId: ${order.id}):`,
          orderItemsError,
        );
        // 주문 상세 조회 실패해도 주문은 반환 (빈 배열로)
        return {
          ...(order as Order),
          order_items: [] as OrderItem[],
        };
      }

      return {
        ...(order as Order),
        order_items: (orderItems || []) as OrderItem[],
      };
    });

    const ordersWithItems = await Promise.all(ordersWithItemsPromises);

    console.log("[orders] 주문 목록 및 상세 조회 완료", {
      clerkId,
      orderCount: ordersWithItems.length,
    });

    return ordersWithItems;
  } catch (error) {
    console.error("[orders] getUserOrders 오류:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("주문 목록 조회 중 오류가 발생했습니다.");
  }
}

/**
 * 특정 주문 상세 조회
 * @param orderId - 주문 ID
 * @returns 주문 정보 (주문 상세 아이템 포함), 주문이 없거나 권한이 없으면 null
 */
export async function getOrderById(
  orderId: string,
): Promise<OrderWithItems | null> {
  try {
    const clerkId = await getAuthenticatedUserId();

    console.log("[orders] 주문 상세 조회 시작", { clerkId, orderId });

    const supabase = getServiceRoleClient();

    // 1. 주문 조회 (권한 확인 포함)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("clerk_id", clerkId)
      .single();

    if (orderError || !order) {
      console.log("[orders] 주문 조회 실패 또는 권한 없음", {
        clerkId,
        orderId,
        error: orderError,
      });
      return null;
    }

    console.log("[orders] 주문 조회 완료", {
      clerkId,
      orderId: order.id,
    });

    // 2. 주문 상세 아이템 조회
    const { data: orderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (orderItemsError) {
      console.error("[orders] 주문 상세 조회 오류:", orderItemsError);
      throw new Error("주문 상세 조회 실패");
    }

    const orderWithItems: OrderWithItems = {
      ...(order as Order),
      order_items: (orderItems || []) as OrderItem[],
    };

    console.log("[orders] 주문 상세 조회 완료", {
      clerkId,
      orderId: orderWithItems.id,
      itemCount: orderWithItems.order_items.length,
    });

    return orderWithItems;
  } catch (error) {
    console.error("[orders] getOrderById 오류:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("주문 상세 조회 중 오류가 발생했습니다.");
  }
}