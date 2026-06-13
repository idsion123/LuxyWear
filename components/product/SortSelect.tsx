"use client";

import { useRouter } from "next/navigation";

export function SortSelect({
  currentSort,
  category,
  search,
}: {
  currentSort: string;
  category?: string;
  search?: string;
}) {
  const router = useRouter();

  return (
    <select
      name="sort"
      onChange={(e) => {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (search) params.set("search", search);
        params.set("sort", e.target.value);
        router.push(`/products?${params.toString()}`);
      }}
      defaultValue={currentSort}
      className="rounded-sm border border-[#e8e3de] px-3 py-1.5 text-sm text-[#7a746e] outline-none"
    >
      <option value="newest">最新</option>
      <option value="price_asc">价格: 低到高</option>
      <option value="price_desc">价格: 高到低</option>
      <option value="name_asc">名称: A-Z</option>
    </select>
  );
}
