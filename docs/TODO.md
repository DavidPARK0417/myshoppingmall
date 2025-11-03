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
  - [x] 상품 목록 표시 (인기 상품, 신상품 등)
  - [x] 카테고리별 섹션 구성
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
- [ ] 상품 상세 페이지 (`app/products/[id]/page.tsx`)
  - [ ] 상품 정보 표시
  - [ ] 수량 선택 기능
  - [ ] 장바구니 추가 버튼
- [ ] 어드민 상품 등록
  - [ ] 참고: Supabase 대시보드에서 직접 등록 (MVP에서는 어드민 기능 제외)
- [x] Server Actions 구현 (`actions/products.ts`)
  - [x] `getProducts()` - 상품 목록 조회
    - [x] 카테고리 필터링 지원 (선택사항)
    - [x] 페이지네이션 지원 (limit, offset)
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

- [ ] 장바구니 기능
  - [ ] 장바구니 페이지 (`app/cart/page.tsx`)
  - [ ] 장바구니 아이템 추가 (`actions/cart.ts` - `addToCart()`)
  - [ ] 장바구니 아이템 삭제 (`actions/cart.ts` - `removeFromCart()`)
  - [ ] 장바구니 아이템 수량 변경 (`actions/cart.ts` - `updateCartItemQuantity()`)
  - [ ] 장바구니 아이템 조회 (`actions/cart.ts` - `getCartItems()`)
  - [ ] 장바구니 아이템 수 표시 (네비게이션 바)
  - [ ] `clerk_id` 기반 권한 체크 (서버 사이드)
- [ ] 주문 프로세스 구현
  - [ ] 주문 페이지 (`app/checkout/page.tsx`)
  - [ ] 배송지 정보 입력 폼
  - [ ] 주문 요약 (상품 목록, 총 금액)
  - [ ] 주문 생성 Server Action (`actions/orders.ts` - `createOrder()`)
- [ ] 주문 테이블 연동
  - [ ] 주문 저장 (orders, order_items 테이블)
  - [ ] 장바구니 비우기 (주문 완료 후)
  - [ ] 재고 감소 처리 (products 테이블)

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
