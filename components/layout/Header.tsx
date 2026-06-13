"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/store/auth-context";
import { useState } from "react";

export function Header() {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8e3de] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-xl tracking-wider text-[#c9a96e]"
        >
          LUXE
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <NavLink href="/">首页</NavLink>
          <NavLink href="/products">全部商品</NavLink>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="text-sm text-[#7a746e] transition-colors hover:text-[#2d2a24]"
          >
            购物车
          </Link>

          {loading ? null : user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 text-sm text-[#7a746e] hover:text-[#2d2a24]">
                <span className="relative inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#f5f0eb]">
                  {user.avatar ? (
                    <Image src={user.avatar} alt="" fill className="object-cover" />
                  ) : (
                    <span className="text-xs text-[#c9a96e]">{user.name.charAt(0)}</span>
                  )}
                </span>
                {user.name}
              </button>
              {/* Invisible bridge so mouse doesn't hit dead zone */}
              <div className="absolute -bottom-1 left-0 right-0 z-10 h-3" />
              <div className="invisible absolute right-0 top-full z-10 w-36 rounded-sm bg-white shadow-lg ring-1 ring-black/5 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                <Link
                  href="/favorites"
                  className="block px-4 py-2 text-sm text-[#7a746e] hover:bg-[#f5f0eb]"
                >
                  我的收藏
                </Link>
                <Link
                  href="/orders"
                  className="block px-4 py-2 text-sm text-[#7a746e] hover:bg-[#f5f0eb]"
                >
                  我的订单
                </Link>
                <Link
                  href="/account"
                  className="block px-4 py-2 text-sm text-[#7a746e] hover:bg-[#f5f0eb]"
                >
                  账户信息
                </Link>
              </div>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm text-[#7a746e] transition-colors hover:text-[#2d2a24]"
            >
              登录
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col gap-1 md:hidden"
          >
            <span className="block h-0.5 w-5 bg-[#2d2a24]" />
            <span className="block h-0.5 w-5 bg-[#2d2a24]" />
            <span className="block h-0.5 w-5 bg-[#2d2a24]" />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="border-t border-[#e8e3de] bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <MobileNavLink href="/" onClick={() => setMenuOpen(false)}>
              首页
            </MobileNavLink>
            <MobileNavLink href="/products" onClick={() => setMenuOpen(false)}>
              全部商品
            </MobileNavLink>
            <MobileNavLink href="/cart" onClick={() => setMenuOpen(false)}>
              购物车
            </MobileNavLink>
            {user && (
              <>
                <MobileNavLink href="/favorites" onClick={() => setMenuOpen(false)}>
                  我的收藏
                </MobileNavLink>
                <MobileNavLink href="/orders" onClick={() => setMenuOpen(false)}>
                  我的订单
                </MobileNavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm text-[#7a746e] transition-colors hover:text-[#2d2a24]"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-sm text-[#7a746e]"
    >
      {children}
    </Link>
  );
}
