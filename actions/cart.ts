"use server";

import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type { CartItem, CartItemRow } from "@/types/cart";
import type { Product } from "@/types/product";

/**
 * @file cart.ts
 * @description 장바구니 관련 Server Actions
 *
 * 장바구니 아이템의 추가, 삭제, 수량 변경, 조회 기능을 제공합니다.
 * Clerk 인증을 통해 사용자 권한을 확인하고, service-role 클라이언트를 사용합니다.
 */

/**
 * Clerk 인증 확인 및 clerk_id 반환
 */
async function getAuthenticatedUserId(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    console.error("[cart] 인증되지 않은 사용자");
    throw new Error("인증이 필요합니다. 로그인 후 이용해주세요.");
  }

  return userId;
}

/**
 * 장바구니에 상품 추가
 * @param productId - 상품 ID (UUID)
 * @param quantity - 추가할 수량
 * @returns 추가된 장바구니 아이템
 */
export async function addToCart(
  productId: string,
  quantity: number,
): Promise<CartItem> {
  try {
    const clerkId = await getAuthenticatedUserId();

    console.log("[cart] 장바구니 추가 시작", {
      clerkId,
      productId,
      quantity,
    });

    // 입력값 검증
    if (!productId || quantity < 1) {
      throw new Error("유효하지 않은 입력값입니다.");
    }

    const supabase = getServiceRoleClient();

    // 1. 상품 정보 조회 및 재고 확인
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
      console.error("[cart] 상품 조회 오류:", productError);
      throw new Error("상품을 찾을 수 없습니다.");
    }

    // 재고 확인
    if (product.stock_quantity < quantity) {
      console.error("[cart] 재고 부족", {
        productId,
        requested: quantity,
        available: product.stock_quantity,
      });
      throw new Error(
        `재고가 부족합니다. (재고: ${product.stock_quantity}개, 요청: ${quantity}개)`,
      );
    }

    // 2. 기존 장바구니 아이템 확인
    const { data: existingItem, error: existingError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("clerk_id", clerkId)
      .eq("product_id", productId)
      .single();

    if (existingError && existingError.code !== "PGRST116") {
      // PGRST116: no rows returned (존재하지 않음)
      console.error("[cart] 기존 아이템 조회 오류:", existingError);
      throw new Error("장바구니 조회 중 오류가 발생했습니다.");
    }

    if (existingItem) {
      // 기존 아이템이 있는 경우 수량 합산
      const newQuantity = existingItem.quantity + quantity;

      // 재고 확인 (합산된 수량 기준)
      if (product.stock_quantity < newQuantity) {
        console.error("[cart] 재고 부족 (기존 아이템 수량 합산)", {
          productId,
          existingQuantity: existingItem.quantity,
          additional: quantity,
          newQuantity,
          available: product.stock_quantity,
        });
        throw new Error(
          `재고가 부족합니다. (현재 장바구니: ${existingItem.quantity}개, 추가 요청: ${quantity}개, 재고: ${product.stock_quantity}개)`,
        );
      }

      // 수량 업데이트
      const { data: updatedItem, error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existingItem.id)
        .select()
        .single();

      if (updateError || !updatedItem) {
        console.error("[cart] 수량 업데이트 오류:", updateError);
        throw new Error("장바구니 수량 업데이트 실패");
      }

      // 상품 정보와 함께 반환
      const { data: productData } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      console.log("[cart] 장바구니 수량 업데이트 완료", {
        cartItemId: updatedItem.id,
        newQuantity,
      });

      return {
        ...updatedItem,
        product: productData as Product,
      } as CartItem;
    } else {
      // 새로운 아이템 추가
      const { data: newItem, error: insertError } = await supabase
        .from("cart_items")
        .insert({
          clerk_id: clerkId,
          product_id: productId,
          quantity,
        })
        .select()
        .single();

      if (insertError || !newItem) {
        console.error("[cart] 아이템 추가 오류:", insertError);
        throw new Error("장바구니 추가 실패");
      }

      console.log("[cart] 장바구니 추가 완료", {
        cartItemId: newItem.id,
        quantity,
      });

      return {
        ...newItem,
        product: product as Product,
      } as CartItem;
    }
  } catch (error) {
    console.error("[cart] addToCart 오류:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("장바구니 추가 중 오류가 발생했습니다.");
  }
}

/**
 * 장바구니에서 아이템 삭제
 * @param cartItemId - 장바구니 아이템 ID (UUID)
 */
export async function removeFromCart(cartItemId: string): Promise<void> {
  try {
    const clerkId = await getAuthenticatedUserId();

    console.log("[cart] 장바구니 아이템 삭제 시작", {
      clerkId,
      cartItemId,
    });

    if (!cartItemId) {
      throw new Error("유효하지 않은 입력값입니다.");
    }

    const supabase = getServiceRoleClient();

    // 권한 확인: 본인의 아이템만 삭제 가능
    const { data: cartItem, error: checkError } = await supabase
      .from("cart_items")
      .select("id, clerk_id")
      .eq("id", cartItemId)
      .single();

    if (checkError || !cartItem) {
      console.error("[cart] 아이템 조회 오류:", checkError);
      throw new Error("장바구니 아이템을 찾을 수 없습니다.");
    }

    if (cartItem.clerk_id !== clerkId) {
      console.error("[cart] 권한 없음", {
        cartItemClerkId: cartItem.clerk_id,
        currentClerkId: clerkId,
      });
      throw new Error("권한이 없습니다.");
    }

    // 삭제
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);

    if (deleteError) {
      console.error("[cart] 삭제 오류:", deleteError);
      throw new Error("장바구니 아이템 삭제 실패");
    }

    console.log("[cart] 장바구니 아이템 삭제 완료", { cartItemId });
  } catch (error) {
    console.error("[cart] removeFromCart 오류:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("장바구니 아이템 삭제 중 오류가 발생했습니다.");
  }
}

/**
 * 장바구니 아이템 수량 변경
 * @param cartItemId - 장바구니 아이템 ID (UUID)
 * @param quantity - 새로운 수량
 */
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
): Promise<CartItem> {
  try {
    const clerkId = await getAuthenticatedUserId();

    console.log("[cart] 장바구니 수량 변경 시작", {
      clerkId,
      cartItemId,
      quantity,
    });

    if (!cartItemId || quantity < 1) {
      throw new Error("유효하지 않은 입력값입니다.");
    }

    const supabase = getServiceRoleClient();

    // 권한 확인 및 장바구니 아이템 조회
    const { data: cartItem, error: checkError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("id", cartItemId)
      .single();

    if (checkError || !cartItem) {
      console.error("[cart] 아이템 조회 오류:", checkError);
      throw new Error("장바구니 아이템을 찾을 수 없습니다.");
    }

    if (cartItem.clerk_id !== clerkId) {
      console.error("[cart] 권한 없음", {
        cartItemClerkId: cartItem.clerk_id,
        currentClerkId: clerkId,
      });
      throw new Error("권한이 없습니다.");
    }

    // 상품 정보 조회 및 재고 확인
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", cartItem.product_id)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
      console.error("[cart] 상품 조회 오류:", productError);
      throw new Error("상품을 찾을 수 없습니다.");
    }

    // 재고 확인
    if (product.stock_quantity < quantity) {
      console.error("[cart] 재고 부족", {
        productId: cartItem.product_id,
        requested: quantity,
        available: product.stock_quantity,
      });
      throw new Error(
        `재고가 부족합니다. (재고: ${product.stock_quantity}개, 요청: ${quantity}개)`,
      );
    }

    // 수량 업데이트
    const { data: updatedItem, error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId)
      .select()
      .single();

    if (updateError || !updatedItem) {
      console.error("[cart] 수량 업데이트 오류:", updateError);
      throw new Error("장바구니 수량 변경 실패");
    }

    console.log("[cart] 장바구니 수량 변경 완료", {
      cartItemId,
      newQuantity: quantity,
    });

    return {
      ...updatedItem,
      product: product as Product,
    } as CartItem;
  } catch (error) {
    console.error("[cart] updateCartItemQuantity 오류:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("장바구니 수량 변경 중 오류가 발생했습니다.");
  }
}

/**
 * 장바구니 아이템 목록 조회
 * @returns 장바구니 아이템 목록 (상품 정보 포함)
 */
export async function getCartItems(): Promise<CartItem[]> {
  try {
    const clerkId = await getAuthenticatedUserId();

    console.log("[cart] 장바구니 아이템 조회 시작", { clerkId });

    const supabase = getServiceRoleClient();

    // 장바구니 아이템과 상품 정보 JOIN 조회
    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        *,
        products:product_id (
          *
        )
      `,
      )
      .eq("clerk_id", clerkId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[cart] 장바구니 조회 오류:", error);
      throw new Error("장바구니 조회 실패");
    }

    // 데이터 변환 (Supabase JOIN 결과를 CartItem 형태로)
    const cartItems: CartItem[] =
      data?.map((item: any) => {
        const product = Array.isArray(item.products)
          ? item.products[0]
          : item.products;

        return {
          id: item.id,
          clerk_id: item.clerk_id,
          product_id: item.product_id,
          quantity: item.quantity,
          created_at: item.created_at,
          updated_at: item.updated_at,
          product: product as Product,
        };
      }) ?? [];

    console.log("[cart] 장바구니 조회 완료", {
      clerkId,
      count: cartItems.length,
    });

    return cartItems;
  } catch (error) {
    console.error("[cart] getCartItems 오류:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("장바구니 조회 중 오류가 발생했습니다.");
  }
}

/**
 * 장바구니 아이템 개수 조회 (GNB 뱃지용)
 * @returns 장바구니 아이템 개수
 */
export async function getCartItemsCount(): Promise<number> {
  try {
    const clerkId = await getAuthenticatedUserId();

    console.log("[cart] 장바구니 개수 조회 시작", { clerkId });

    const supabase = getServiceRoleClient();

    const { count, error } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("clerk_id", clerkId);

    if (error) {
      console.error("[cart] 장바구니 개수 조회 오류:", error);
      throw new Error("장바구니 개수 조회 실패");
    }

    console.log("[cart] 장바구니 개수 조회 완료", {
      clerkId,
      count: count ?? 0,
    });

    return count ?? 0;
  } catch (error) {
    console.error("[cart] getCartItemsCount 오류:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("장바구니 개수 조회 중 오류가 발생했습니다.");
  }
}

/**
 * 장바구니 전체 비우기
 * @returns 삭제된 아이템 개수
 */
export async function clearCart(): Promise<number> {
  try {
    const clerkId = await getAuthenticatedUserId();

    console.log("[cart] 장바구니 전체 비우기 시작", { clerkId });

    const supabase = getServiceRoleClient();

    // 먼저 개수 조회
    const { count: beforeCount } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("clerk_id", clerkId);

    // 삭제
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("clerk_id", clerkId);

    if (error) {
      console.error("[cart] 장바구니 비우기 오류:", error);
      throw new Error("장바구니 비우기 실패");
    }

    console.log("[cart] 장바구니 전체 비우기 완료", {
      clerkId,
      deletedCount: beforeCount ?? 0,
    });

    return beforeCount ?? 0;
  } catch (error) {
    console.error("[cart] clearCart 오류:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("장바구니 비우기 중 오류가 발생했습니다.");
  }
}
