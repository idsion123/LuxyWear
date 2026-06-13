import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-4 font-serif text-6xl text-[#c9a96e]">404</h1>
      <p className="mb-8 text-sm text-[#7a746e]">页面未找到</p>
      <Link
        href="/"
        className="rounded-sm border border-[#c9a96e] px-8 py-2.5 text-sm text-[#c9a96e] transition-colors hover:bg-[#c9a96e] hover:text-white"
      >
        返回首页
      </Link>
    </div>
  );
}
