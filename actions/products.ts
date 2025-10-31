"use server";

import { createClient } from "@supabase/supabase-js";
import type { Product } from "@/types/product";

/**
 * @file products.ts
 * @description 상품 관련 Server Actions
 *
 * Supabase에서 상품 데이터를 조회하는 Server Actions입니다.
 * 공개 데이터이므로 인증이 필요하지 않습니다.
 */

/**
 * Supabase 클라이언트 생성 (인증 불필요 - 공개 데이터)
 */
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * 전체 상품 목록 조회 (페이지네이션 지원)
 * @param options - 조회 옵션
 * @param options.category - 카테고리 필터 (선택사항)
 * @param options.limit - 페이지당 상품 수 (기본값: 12)
 * @param options.offset - 건너뛸 상품 수 (기본값: 0)
 * @returns 활성화된 상품 목록 (최신순)
 */
export async function getProducts(options?: {
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  try {
    const { category, limit = 12, offset = 0 } = options || {};
    console.log("[products] 전체 상품 목록 조회 시작", {
      category,
      limit,
      offset,
    });

    const supabase = createSupabaseClient();

    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[products] 상품 조회 오류:", error);
      throw new Error(`상품 조회 실패: ${error.message}`);
    }

    console.log("[products] 상품 조회 완료", { count: data?.length ?? 0 });
    return (data as Product[]) ?? [];
  } catch (error) {
    console.error("[products] getProducts 오류:", error);
    throw error;
  }
}

/**
 * 전체 상품 개수 조회 (페이지네이션용)
 * @param category - 카테고리 필터 (선택사항)
 * @returns 전체 상품 개수
 */
export async function getProductsCount(category?: string): Promise<number> {
  try {
    console.log("[products] 상품 개수 조회 시작", { category });

    const supabase = createSupabaseClient();

    let query = supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (category) {
      query = query.eq("category", category);
    }

    const { count, error } = await query;

    if (error) {
      console.error("[products] 상품 개수 조회 오류:", error);
      throw new Error(`상품 개수 조회 실패: ${error.message}`);
    }

    console.log("[products] 상품 개수 조회 완료", { count });
    return count ?? 0;
  } catch (error) {
    console.error("[products] getProductsCount 오류:", error);
    throw error;
  }
}

/**
 * 인기 상품 조회 (임의 선정, 최신순)
 * @param limit - 조회할 최대 개수 (기본값: 8)
 * @returns 인기 상품 목록
 */
export async function getFeaturedProducts(
  limit: number = 8,
): Promise<Product[]> {
  try {
    console.log("[products] 인기 상품 조회 시작", { limit });

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[products] 인기 상품 조회 오류:", error);
      throw new Error(`인기 상품 조회 실패: ${error.message}`);
    }

    console.log("[products] 인기 상품 조회 완료", { count: data?.length ?? 0 });
    return (data as Product[]) ?? [];
  } catch (error) {
    console.error("[products] getFeaturedProducts 오류:", error);
    throw error;
  }
}

/**
 * 카테고리별 상품 조회
 * @param category - 카테고리 코드 (예: 'electronics', 'clothing')
 * @param limit - 조회할 최대 개수 (기본값: 4)
 * @returns 해당 카테고리의 상품 목록
 */
export async function getProductsByCategory(
  category: string,
  limit: number = 4,
): Promise<Product[]> {
  try {
    console.log("[products] 카테고리별 상품 조회 시작", { category, limit });

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("category", category)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[products] 카테고리별 상품 조회 오류:", error);
      throw new Error(`카테고리별 상품 조회 실패: ${error.message}`);
    }

    console.log("[products] 카테고리별 상품 조회 완료", {
      category,
      count: data?.length ?? 0,
    });
    return (data as Product[]) ?? [];
  } catch (error) {
    console.error("[products] getProductsByCategory 오류:", error);
    throw error;
  }
}

/**
 * 상품 상세 조회
 * @param id - 상품 ID (UUID)
 * @returns 상품 정보
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    console.log("[products] 상품 상세 조회 시작", { id });

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("[products] 상품 상세 조회 오류:", error);
      throw new Error(`상품 상세 조회 실패: ${error.message}`);
    }

    console.log("[products] 상품 상세 조회 완료", { id });
    return (data as Product) ?? null;
  } catch (error) {
    console.error("[products] getProductById 오류:", error);
    throw error;
  }
}
