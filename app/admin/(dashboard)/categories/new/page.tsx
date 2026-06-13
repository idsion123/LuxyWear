"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9一-龥]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description }),
      });
      if (res.ok) {
        router.push("/admin/categories");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch {
      setError("创建失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-[#2d2a24]">新增分类</h1>
        <p className="mt-1 text-sm text-[#7a746e]">创建新的商品分类</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="border border-[#e8e3de] bg-white p-6 space-y-5">
          <div>
            <label className="mb-1.5 block text-xs tracking-wider text-[#7a746e] uppercase">名称</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug || slug === generateSlug(slug)) {
                  setSlug(generateSlug(e.target.value));
                }
              }}
              className="w-full border border-[#e8e3de] px-4 py-2.5 text-sm text-[#2d2a24] outline-none transition-colors focus:border-[#c9a96e]"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs tracking-wider text-[#7a746e] uppercase">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              className="w-full border border-[#e8e3de] px-4 py-2.5 text-sm text-[#2d2a24] outline-none transition-colors focus:border-[#c9a96e]"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs tracking-wider text-[#7a746e] uppercase">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-[#e8e3de] px-4 py-2.5 text-sm text-[#2d2a24] outline-none transition-colors focus:border-[#c9a96e] resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="border border-[#c9a96e] bg-[#c9a96e] px-6 py-2.5 text-sm text-white transition-colors hover:bg-[#a8884a] hover:border-[#a8884a] disabled:opacity-50"
          >
            {loading ? "创建中..." : "创建"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-[#e8e3de] px-6 py-2.5 text-sm text-[#7a746e] transition-colors hover:border-[#c9a96e] hover:text-[#c9a96e]"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
