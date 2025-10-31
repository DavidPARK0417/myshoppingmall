import { MetadataRoute } from "next";

/**
 * @file robots.ts
 * @description robots.txt 파일 생성
 *
 * 검색 엔진 크롤러가 사이트를 크롤링할 때 따라야 할 규칙을 정의합니다.
 * Next.js가 자동으로 /robots.txt 경로로 이 파일을 제공합니다.
 */

export default function robots(): MetadataRoute.Robots {
  // 프로덕션 환경에서는 실제 도메인으로 변경
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/", // API 라우트는 크롤링 제외
        "/auth-test/", // 테스트 페이지 제외
        "/storage-test/", // 테스트 페이지 제외
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
