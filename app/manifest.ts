import { MetadataRoute } from "next";

/**
 * @file manifest.ts
 * @description PWA 매니페스트 파일 생성
 *
 * 웹 앱을 설치 가능한 앱처럼 만들기 위한 매니페스트 정보를 정의합니다.
 * Next.js가 자동으로 /manifest.json 경로로 이 파일을 제공합니다.
 */

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "쇼핑몰 앱",
    short_name: "쇼핑몰",
    description: "Next.js + Clerk + Supabase로 구축된 쇼핑몰 앱",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-256x256.png",
        sizes: "256x256",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
