# 쇼핑몰 MVP 개발 TODO 리스트

## Phase 1: 기본 인프라 (1주)

- [x] Next.js 프로젝트 셋업
- [x] Supabase 프로젝트 생성 및 테이블 스키마 작성
  - [x] `products` 테이블 (상품 정보)
  - [x] `cart_items` 테이블 (장바구니)
  - [x] `orders` 테이블 (주문)
  - [x] `order_items` 테이블 (주문 상세)
  - [x] 인덱스 및 트리거 설정
  - [x] 샘플 데이터 삽입 (20개)
- [x] Clerk 연동 (회원가입/로그인)
- [x] 기본 레이아웃 및 라우팅
- [x] 프로젝트 메타데이터 파일 추가
  - [x] `app/not-found.tsx` 파일
  - [x] `app/robots.ts` 파일
  - [x] `app/sitemap.ts` 파일
  - [x] `app/manifest.ts` 파일

## Phase 2: 상품 기능 (1주)

- [x] 홈페이지
  - [x] 상품 목록 표시 (4가지 정렬 섹션: 최신순, 인기순, 낮은 가격순, 높은 가격순)
  - [x] 정렬 필터 추가 (`components/product-sort-filter-home.tsx`)
    - [x] 카테고리 필터 아래에 정렬 필터 배치
    - [x] 버튼 형태 UI (최신순, 인기순, 낮은 가격순, 높은 가격순)
    - [x] 정렬 선택 시 해당 정렬 기준으로 상품 표시
    - [x] 정렬 미선택 시 4가지 정렬 섹션 모두 표시
  - [x] 카테고리 필터와 정렬 필터 연동
- [x] 상품 목록 페이지 (`app/products/page.tsx`)
  - [x] 페이지 기본 구조 및 레이아웃
    - [x] 헤더 영역 (제목, 총 상품 개수 표시)
    - [x] 카테고리 필터 영역
    - [x] 상품 목록 표시 영역
    - [x] 페이지네이션 영역
  - [x] 페이지네이션 구현
    - [x] 페이지 번호 방식 (현재 페이지 주변 2페이지만 표시)
    - [x] 이전/다음 버튼
    - [x] 생략 표시 (ellipsis) 처리
    - [x] 카테고리 필터와 페이지네이션 연동
  - [x] 카테고리 필터 연동
    - [x] URL 쿼리 파라미터로 카테고리 전달
    - [x] 필터 변경 시 첫 페이지로 이동
  - [x] Server Component 구현
    - [x] `searchParams` 비동기 처리 (Next.js 15)
    - [x] 병렬 데이터 조회 (`Promise.all`)
    - [x] 로깅 추가 (개발 환경 디버깅용)
  - [x] UI 컴포넌트 통합
    - [x] `ProductList` 컴포넌트 사용
    - [x] `ProductCategoryFilter` 컴포넌트 사용 (Suspense 래핑)
    - [x] 빈 상태 메시지 처리
- [x] 카테고리 필터링
  - [x] 카테고리별 필터 UI (`components/product-category-filter.tsx`)
    - [x] 전체/카테고리 버튼 UI
    - [x] 선택된 카테고리 강조 표시
    - [x] URL 쿼리 파라미터 기반 필터링
    - [x] 홈페이지/상품 목록 페이지 모두 지원 (basePath prop)
    - [x] 홈페이지에서 필터 클릭 시 스크롤 처리
  - [x] 필터 적용 기능 (electronics, clothing, books, food, sports, beauty, home)
- [x] 상품 목록 UI 컴포넌트 (`components/product-list.tsx`)
  - [x] 반응형 그리드 레이아웃 (1열 → 2열 → 3열 → 4열)
  - [x] 빈 상태 메시지 표시
  - [x] ProductCard 컴포넌트 통합
- [x] 상품 카드 컴포넌트 (`components/product-card.tsx`)
  - [x] 상품 이미지 표시
  - [x] 상품명, 가격, 재고 상태 표시
  - [x] 상품 상세 페이지 링크
  - [x] 가격 포맷팅 (천 단위 구분)
  - [x] 재고 상태 표시 (재고 있음/부족/품절)
- [x] 상품 상세 페이지 (`app/products/[id]/page.tsx`)
  - [x] 페이지 기본 구조 및 레이아웃
    - [x] 3열 레이아웃 구현 (반응형: 모바일 1열, 데스크톱 3열)
    - [x] 왼쪽 열: 제품 이미지 영역 (플레이스홀더 표시)
    - [x] 중간 열: 제품 정보 영역 (이름, 가격, 재고, 카테고리, 설명, 등록일, 수정일)
    - [x] 오른쪽 열 (고정): 장바구니 UI (수량 선택, 장바구니 추가 버튼)
    - [x] 수정일 표시 (updated_at, 날짜 포맷팅)
  - [x] 상품 정보 표시
    - [x] 상품명 표시 (name)
    - [x] 가격 표시 (price, 천 단위 구분 포맷팅)
    - [x] 재고 상태 표시 (stock_quantity 기반, 재고 있음/부족/품절)
    - [x] 카테고리 표시 (category, 한글 라벨 변환)
    - [x] 설명 표시 (description, null 처리)
    - [x] 등록일 표시 (created_at, 날짜 포맷팅)
    - [x] 수정일 표시 (updated_at, 날짜 포맷팅)
  - [x] 수량 선택 기능
    - [x] 수량 입력 UI (증가/감소 버튼) (`components/product-add-to-cart.tsx`)
    - [x] 재고 범위 내 수량 제한 (최소 1개, 최대 stock_quantity)
    - [x] 수량 변경 시 재고 체크
  - [x] 장바구니 추가 버튼
    - [x] 장바구니 추가 Server Action 호출
    - [x] 로딩 상태 처리
    - [x] 성공/실패 메시지 표시 (Dialog로 구현 완료)
    - [x] 재고 부족 시 버튼 비활성화
  - [x] Server Component 구현
    - [x] `params` 비동기 처리 (Next.js 15)
    - [x] `getProductById()` Server Action 사용
    - [x] 상품이 없을 경우 404 처리 (notFound())
    - [x] 로깅 추가 (개발 환경 디버깅용)
  - [x] 공통 유틸리티 함수 (`lib/product-utils.ts`)
    - [x] `formatPrice()` - 가격 포맷팅
    - [x] `getStockStatus()` - 재고 상태 반환
    - [x] `formatDate()` - 날짜 포맷팅
  - [x] 이미지 영역 레이아웃 구현 (플레이스홀더 표시, 추후 Supabase Storage 연동 시 실제 이미지 표시)
- [ ] 어드민 상품 등록
  - [ ] 참고: Supabase 대시보드에서 직접 등록 (MVP에서는 어드민 기능 제외)
- [x] Server Actions 구현 (`actions/products.ts`)
  - [x] `getProducts()` - 상품 목록 조회
    - [x] 카테고리 필터링 지원 (선택사항)
    - [x] 페이지네이션 지원 (limit, offset)
    - [x] 정렬 옵션 지원 (latest, name, popular, price-asc, price-desc)
    - [x] 가격순 정렬 로직 추가 (price-asc, price-desc)
    - [x] 활성화된 상품만 조회 (`is_active = true`)
    - [x] 최신순 정렬 (`created_at DESC`)
    - [x] 에러 핸들링 및 로깅
  - [x] `getProductsCount()` - 전체 상품 개수 조회
    - [x] 카테고리별 개수 조회 지원
    - [x] 페이지네이션 계산용
  - [x] `getFeaturedProducts()` - 인기 상품 조회
    - [x] 홈페이지용 인기 상품 조회
    - [x] 개수 제한 설정 가능
  - [x] `getProductsByCategory(category)` - 카테고리별 조회
    - [x] 특정 카테고리의 상품만 조회
    - [x] 개수 제한 설정 가능
  - [x] `getProductById(id)` - 상품 상세 조회
    - [x] UUID 기반 단일 상품 조회
    - [x] 활성화된 상품만 조회
    - [x] null 반환 처리 (존재하지 않는 상품)

## Phase 3: 장바구니 & 주문 (1주)

- [x] 장바구니 기능
  - [x] 장바구니 페이지 (`app/cart/page.tsx`)
  - [x] 장바구니 아이템 추가 (`actions/cart.ts` - `addToCart()`)
  - [x] 장바구니 아이템 삭제 (`actions/cart.ts` - `removeFromCart()`)
  - [x] 장바구니 아이템 수량 변경 (`actions/cart.ts` - `updateCartItemQuantity()`)
  - [x] 장바구니 아이템 조회 (`actions/cart.ts` - `getCartItems()`)
  - [x] 장바구니 아이템 수 표시 (네비게이션 바 - `components/cart-icon-button.tsx`)
  - [x] `clerk_id` 기반 권한 체크 (서버 사이드)
  - [x] 장바구니 추가 완료 Dialog (`components/product-add-to-cart-dialog.tsx`)
  - [x] 장바구니 아이템 컴포넌트 (`components/cart-item.tsx`)
  - [x] 장바구니 요약 컴포넌트 (`components/cart-summary.tsx`)
  - [x] 빈 장바구니 상태 컴포넌트 (`components/empty-cart.tsx`)
- [x] 주문 프로세스 구현
  - [x] 주문 페이지 (`app/checkout/page.tsx`)
  - [x] 배송지 정보 입력 폼 (`components/shipping-address-form.tsx`)
  - [x] 주문 요약 (상품 목록, 총 금액 - `components/checkout-order-summary.tsx`)
  - [x] 주문 생성 Server Action (`actions/orders.ts` - `createOrder()`)
  - [x] 주문 폼 핸들러 (`components/checkout-form-handler.tsx`)
  - [x] 주문 성공 페이지 (`app/orders/[id]/success/page.tsx`)
- [x] 주문 테이블 연동
  - [x] 주문 저장 (orders, order_items 테이블)
  - [x] 장바구니 비우기 (주문 완료 후)
  - [x] 재고 감소 처리 (products 테이블)
  - [x] 주문 실패 시 롤백 처리 (주문 상세 생성 실패 시 주문 삭제)

## Phase 4: 결제 통합 (1주)

- [ ] Toss Payments MCP 연동
  - [ ] 환경 변수 설정 (Toss Payments API 키)
  - [ ] 결제 위젯 설치 및 설정
- [ ] 테스트 결제 구현
  - [ ] 결제 요청 페이지 (`app/payment/page.tsx`)
  - [ ] 결제 위젯 연동
  - [ ] 테스트 카드 정보 입력 가이드
- [ ] 결제 완료 후 주문 저장
  - [ ] 결제 성공 콜백 처리
  - [ ] 결제 정보를 orders 테이블에 저장
  - [ ] 결제 실패 처리
- [ ] 결제 검증
  - [ ] 결제 금액 검증 (주문 금액과 일치 확인)
  - [ ] 중복 결제 방지

## Phase 5: 마이페이지 (0.5주)

- [ ] 주문 내역 조회
  - [ ] 마이페이지 (`app/my-page/page.tsx`)
  - [ ] 주문 목록 표시 (Server Action: `actions/orders.ts` - `getUserOrders()`)
  - [ ] 주문 상태 표시 (pending, confirmed, shipped, delivered, cancelled)
- [ ] 주문 상세 보기
  - [ ] 주문 상세 페이지 (`app/my-page/orders/[id]/page.tsx`)
  - [ ] 주문 상세 정보 조회 (Server Action: `actions/orders.ts` - `getOrderById()`)
  - [ ] 주문 상품 목록 표시
  - [ ] 배송지 정보 표시

## Phase 6: 테스트 & 배포 (0.5주)

- [ ] 전체 플로우 테스트
  - [ ] 회원가입 → 로그인 테스트
  - [ ] 상품 조회 → 장바구니 추가 테스트
  - [ ] 장바구니 → 주문 생성 테스트
  - [ ] 주문 → 결제 테스트
  - [ ] 결제 완료 → 주문 내역 확인 테스트
- [ ] 버그 수정
  - [ ] 에러 핸들링 개선
  - [ ] UI/UX 개선
  - [ ] 성능 최적화
- [ ] Vercel 배포
  - [ ] 환경 변수 설정
  - [ ] 빌드 테스트
  - [ ] 프로덕션 배포

## 추가 개선 사항 (MVP 이후)

- [ ] 상품 검색 기능
- [ ] 상품 정렬 기능 (가격순, 인기순)
- [ ] 이미지 업로드 (Supabase Storage)
- [ ] 상품 리뷰 시스템
- [ ] 찜하기 기능
- [ ] 쿠폰/할인 기능
- [ ] 배송 추적 기능
