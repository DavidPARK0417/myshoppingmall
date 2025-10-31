import { MetadataRoute } from "next";

/**
 * @file sitemap.ts
 * @description sitemap.xml 파일 생성
 *
 * 검색 엔진이 사이트의 페이지 구조를 이해하는 데 도움이 되는 사이트맵을 생성합니다.
 * Next.js가 자동으로 /sitemap.xml 경로로 이 파일을 제공합니다.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  // 프로덕션 환경에서는 실제 도메인으로 변경
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com";

  // 현재 구현된 주요 페이지들
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
  ];

  // Phase 2에서 구현될 예정인 페이지들 (주석 처리)
  // 추후 실제 페이지가 구현되면 주석을 해제하고 추가하세요
  /*
  const productRoutes = [
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
  ];
  */

  return routes;
}
