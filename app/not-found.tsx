import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * @file not-found.tsx
 * @description 404 페이지 컴포넌트
 *
 * 존재하지 않는 페이지에 접근했을 때 표시되는 404 에러 페이지입니다.
 * 사용자 친화적인 UI로 홈으로 돌아갈 수 있는 버튼을 제공합니다.
 */

export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-8 py-16">
      <section className="w-full max-w-2xl mx-auto text-center flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-9xl font-bold text-gray-300 dark:text-gray-700">
            404
          </h1>
          <h2 className="text-3xl lg:text-4xl font-bold">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto">
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
