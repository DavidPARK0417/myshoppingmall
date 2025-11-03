"use server";

import { createClient } from "@supabase/supabase-js";
import type { Product } from "@/types/product";
import type { SortOption } from "@/lib/sort";

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
 * 전체 상품 목록 조회 (페이지네이션 및 정렬 지원)
 * @param options - 조회 옵션
 * @param options.category - 카테고리 필터 (선택사항)
 * @param options.limit - 페이지당 상품 수 (기본값: 12)
 * @param options.offset - 건너뛸 상품 수 (기본값: 0)
 * @param options.sortBy - 정렬 옵션 (기본값: 'latest')
 * @returns 활성화된 상품 목록
 */
export async function getProducts(options?: {
  category?: string;
  limit?: number;
  offset?: number;
  sortBy?: SortOption;
}): Promise<Product[]> {
  try {
    const { category, limit = 12, offset = 0, sortBy = "latest" } =
      options || {};
    console.log("[products] 전체 상품 목록 조회 시작", {
      category,
      limit,
      offset,
      sortBy,
    });

    const supabase = createSupabaseClient();

    // 인기순 정렬은 별도 처리 (RPC 함수 사용)
    if (sortBy === "popular") {
      return await getProductsSortedByPopularity({
        category,
        limit,
        offset,
      });
    }

    // 최신순, 이름순은 일반 쿼리로 처리
    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .range(offset, offset + limit - 1);

    // 정렬 적용
    if (sortBy === "latest") {
      query = query.order("created_at", { ascending: false });
    } else if (sortBy === "name") {
      query = query.order("name", { ascending: true });
    } else if (sortBy === "price-asc") {
      query = query.order("price", { ascending: true });
    } else if (sortBy === "price-desc") {
      query = query.order("price", { ascending: false });
    }

    // 카테고리 필터 적용
    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[products] 상품 조회 오류:", error);
      throw new Error(`상품 조회 실패: ${error.message}`);
    }

    console.log("[products] 상품 조회 완료", {
      count: data?.length ?? 0,
      sortBy,
    });
    return (data as Product[]) ?? [];
  } catch (error) {
    console.error("[products] getProducts 오류:", error);
    throw error;
  }
}

/**
 * 인기순 정렬된 상품 목록 조회 (주문 수량 기반)
 * @param options - 조회 옵션
 * @returns 인기순으로 정렬된 상품 목록
 */
async function getProductsSortedByPopularity(options?: {
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  try {
    const { category, limit = 12, offset = 0 } = options || {};
    console.log("[products] 인기순 상품 조회 시작", {
      category,
      limit,
      offset,
    });

    const supabase = createSupabaseClient();

    // 인기순 정렬을 위한 RPC 함수 호출 또는 직접 쿼리
    // 우선 간단하게 구현: order_items와 LEFT JOIN하여 주문 수량 집계
    // Supabase PostgREST에서는 복잡한 JOIN과 집계가 제한적이므로
    // 일단 모든 상품을 가져온 후 클라이언트에서 정렬하는 방법 사용
    // 또는 RPC 함수 생성

    // 임시 구현: 일단 최신순으로 정렬하고, 이후 RPC 함수로 개선 가능
    // 실제 프로덕션에서는 PostgreSQL 함수를 생성하여 사용 권장

    // 모든 상품을 가져와서 처리 (성능 고려 필요)
    let baseQuery = supabase
      .from("products")
      .select("*, order_items(quantity)")
      .eq("is_active", true);

    if (category) {
      baseQuery = baseQuery.eq("category", category);
    }

    const { data, error } = await baseQuery;

    if (error) {
      console.error("[products] 인기순 상품 조회 오류:", error);
      throw new Error(`인기순 상품 조회 실패: ${error.message}`);
    }

    // 주문 수량 집계 및 정렬
    const productsWithOrderCount = (data as any[]).map((product) => {
      const orderItems = product.order_items || [];
      const totalOrdered = orderItems.reduce(
        (sum: number, item: { quantity: number }) => sum + (item.quantity || 0),
        0,
      );
      return {
        ...product,
        order_items: undefined, // 원본 Product 타입과 일치하도록 제거
        _total_ordered: totalOrdered, // 정렬용 임시 필드
      };
    });

    // 주문 수량 기준으로 정렬 (내림차순), 동일한 경우 최신순
    productsWithOrderCount.sort((a, b) => {
      if (b._total_ordered !== a._total_ordered) {
        return b._total_ordered - a._total_ordered;
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    // 페이지네이션 적용
    const paginatedProducts = productsWithOrderCount.slice(
      offset,
      offset + limit,
    );

    // 임시 필드 제거
    const result = paginatedProducts.map(({ _total_ordered, ...product }) => product);

    console.log("[products] 인기순 상품 조회 완료", {
      count: result.length,
      totalCount: productsWithOrderCount.length,
    });

    return result as Product[];
  } catch (error) {
    console.error("[products] getProductsSortedByPopularity 오류:", error);
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
