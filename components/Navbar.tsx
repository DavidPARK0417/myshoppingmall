import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import CartIconButton from "@/components/cart-icon-button";

const Navbar = () => {
  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
      <Link href="/" className="text-2xl font-bold">
        SaaS Template
      </Link>
      <div className="flex gap-4 items-center">
        {/* 로그인한 사용자에게만 마이페이지 링크 표시 */}
        <SignedIn>
          <Link href="/my-page">
            <Button variant="ghost" size="sm">
              마이페이지
            </Button>
          </Link>
        </SignedIn>
        {/* 장바구니 아이콘 (왼쪽에 배치) */}
        <SignedIn>
          <CartIconButton />
        </SignedIn>
        <SignedOut>
          <CartIconButton />
        </SignedOut>
        {/* 로그인/회원가입 또는 UserButton */}
        <SignedOut>
          <SignInButton mode="modal">
            <Button>로그인</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
};

export default Navbar;
