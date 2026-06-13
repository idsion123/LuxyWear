"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.push("/admin/login");
        } else {
          setAdmin(data.user);
        }
      })
      .catch(() => router.push("/admin/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    document.cookie = "admin_session=; path=/; max-age=0";
    router.push("/admin/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f5]">
        <div className="text-sm text-[#7a746e]">加载中...</div>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      <nav className="flex w-56 flex-col border-r border-[#e8e3de] bg-white px-4 py-8">
        <div className="mb-8 px-3">
          <h2 className="font-serif text-lg text-[#c9a96e]">Fashion Admin</h2>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <NavLink href="/admin" label="数据看板" current={pathname} />
          <NavLink href="/admin/products" label="商品管理" current={pathname} />
          <NavLink href="/admin/categories" label="分类管理" current={pathname} />
          <NavLink href="/admin/orders" label="订单管理" current={pathname} />
          <NavLink href="/admin/users" label="用户管理" current={pathname} />
        </div>
        <div className="border-t border-[#e8e3de] px-3 pt-4">
          <div className="text-xs text-[#7a746e]">{admin.email}</div>
          <button
            onClick={handleLogout}
            className="mt-2 text-xs text-red-400 hover:text-red-600"
          >
            退出登录
          </button>
        </div>
      </nav>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  label,
  current,
}: {
  href: string;
  label: string;
  current: string;
}) {
  const isActive = current === href || current.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`rounded-sm px-3 py-2 text-sm transition-colors ${
        isActive
          ? "bg-[#f5f0eb] text-[#c9a96e]"
          : "text-[#7a746e] hover:bg-[#f5f0eb] hover:text-[#2d2a24]"
      }`}
    >
      {label}
    </Link>
  );
}
