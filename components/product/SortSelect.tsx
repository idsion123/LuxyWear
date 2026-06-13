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
      className="appearance-none rounded-none border border-[#e8e3de] bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%228%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M1%201.5l5%205%205-5%22%20stroke%3D%22%237a746e%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[right_12px_center] bg-no-repeat py-2.5 pl-4 pr-10 text-sm text-[#7a746e] outline-none transition-colors focus:border-[#c9a96e]"
    >
      <option value="newest">最新</option>
      <option value="price_asc">价格: 低到高</option>
      <option value="price_desc">价格: 高到低</option>
      <option value="name_asc">名称: A-Z</option>
    </select>
  );
}
