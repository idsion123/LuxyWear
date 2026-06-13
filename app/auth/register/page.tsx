"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, name);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-serif text-[#2d2a24]">
          注册
        </h1>
        <p className="mb-8 text-center text-sm text-[#7a746e]">
          创建您的账户，开启精致购物体验
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-sm bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm text-[#7a746e]"
            >
              姓名
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-sm border border-[#e8e3de] px-4 py-2.5 text-sm text-[#2d2a24] outline-none transition-colors focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e]"
              placeholder="您的姓名"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm text-[#7a746e]"
            >
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm border border-[#e8e3de] px-4 py-2.5 text-sm text-[#2d2a24] outline-none transition-colors focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e]"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm text-[#7a746e]"
            >
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-[#e8e3de] px-4 py-2.5 text-sm text-[#2d2a24] outline-none transition-colors focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e]"
              placeholder="至少6个字符"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-[#c9a96e] px-4 py-2.5 text-sm text-white transition-colors hover:bg-[#a8884a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "注册中..." : "注册"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#7a746e]">
          已有账户？{" "}
          <Link
            href="/auth/login"
            className="text-[#c9a96e] hover:text-[#a8884a]"
          >
            登录
          </Link>
        </p>
      </div>
    </div>
  );
}
