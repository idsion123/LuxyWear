"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  stock: number;
  isPublished: boolean;
  createdAt: string;
  images: string[];
}
interface Category {
  id: string;
  name: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  useEffect(() => {
    fetch("/api/categories?all=true")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ admin: "true", page: String(page), limit: String(limit) });
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => {
    startTransition(() => {
      fetchProducts();
    });
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此商品？")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-[#2d2a24]">商品管理</h1>
          <p className="mt-1 text-sm text-[#7a746e]">共 {total} 件商品</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 border border-[#c9a96e] bg-[#c9a96e] px-4 py-2 text-sm text-white transition-colors hover:bg-[#a8884a] hover:border-[#a8884a]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          新增商品
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a746e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="搜索商品名称..."
            className="w-full sm:w-64 border border-[#e8e3de] py-2.5 pl-10 pr-4 text-sm text-[#2d2a24] outline-none transition-colors focus:border-[#c9a96e] placeholder:text-[#7a746e]/60"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="appearance-none border border-[#e8e3de] bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%228%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M1%201.5l5%205%205-5%22%20stroke%3D%22%237a746e%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[right_12px_center] bg-no-repeat py-2.5 pl-4 pr-10 text-sm text-[#7a746e] outline-none transition-colors focus:border-[#c9a96e]"
        >
          <option value="">全部分类</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-[#e8e3de] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#e8e3de] bg-[#faf8f5]">
              <th className="px-5 py-3.5 text-xs font-medium tracking-wider text-[#7a746e] uppercase">商品</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wider text-[#7a746e] uppercase">价格</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wider text-[#7a746e] uppercase">库存</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wider text-[#7a746e] uppercase">状态</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wider text-[#7a746e] uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-[#7a746e]">加载中...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-[#7a746e]">暂无商品</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-[#e8e3de] last:border-0 hover:bg-[#faf8f5]/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3.5">
                      {product.images?.[0] ? (
                        <div className="relative h-12 w-12 overflow-hidden border border-[#e8e3de] bg-[#f5f0eb]">
                          <Image src={product.images[0]} alt="" fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center border border-[#e8e3de] bg-[#f5f0eb] text-xs text-[#e8e3de]">
                          —
                        </div>
                      )}
                      <span className="font-medium text-[#2d2a24]">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#c9a96e]">¥{product.price}</td>
                  <td className="px-5 py-4 text-[#7a746e]">{product.stock}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-3 py-1 text-xs tracking-wider uppercase ${
                      product.isPublished
                        ? "border border-green-200 bg-green-50 text-green-700"
                        : "border border-gray-200 bg-gray-50 text-gray-500"
                    }`}>
                      {product.isPublished ? "已上架" : "已下架"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-3">
                      <Link href={`/admin/products/${product.id}/edit`} className="text-xs tracking-wider text-[#c9a96e] transition-colors hover:text-[#a8884a] uppercase">
                        编辑
                      </Link>
                      <button onClick={() => handleDelete(product.id)} className="text-xs tracking-wider text-red-400 transition-colors hover:text-red-600 uppercase">
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="border border-[#e8e3de] px-3 py-1.5 text-xs tracking-wider text-[#7a746e] uppercase transition-colors hover:border-[#c9a96e] hover:text-[#c9a96e] disabled:opacity-40"
          >
            上一页
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 text-xs transition-colors ${
                p === page
                  ? "bg-[#c9a96e] text-white"
                  : "border border-[#e8e3de] text-[#7a746e] hover:border-[#c9a96e] hover:text-[#c9a96e]"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="border border-[#e8e3de] px-3 py-1.5 text-xs tracking-wider text-[#7a746e] uppercase transition-colors hover:border-[#c9a96e] hover:text-[#c9a96e] disabled:opacity-40"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
