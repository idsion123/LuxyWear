"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

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
    fetchProducts();
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
        <h1 className="text-2xl font-serif text-[#2d2a24]">商品管理</h1>
        <Link
          href="/admin/products/new"
          className="rounded-sm bg-[#c9a96e] px-4 py-2 text-sm text-white hover:bg-[#a8884a]"
        >
          新增商品
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="搜索商品名称..."
          className="w-full max-w-xs rounded-sm border border-[#e8e3de] px-4 py-2 text-sm outline-none focus:border-[#c9a96e]"
        />
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="rounded-sm border border-[#e8e3de] px-4 py-2 text-sm text-[#7a746e] outline-none focus:border-[#c9a96e]"
        >
          <option value="">全部分类</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#e8e3de] text-[#7a746e]">
              <th className="px-6 py-4 font-medium">商品</th>
              <th className="px-6 py-4 font-medium">价格</th>
              <th className="px-6 py-4 font-medium">库存</th>
              <th className="px-6 py-4 font-medium">状态</th>
              <th className="px-6 py-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[#7a746e]">加载中...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[#7a746e]">暂无商品</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-[#e8e3de] last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] && (
                        <img src={product.images[0]} alt="" className="h-10 w-10 rounded-sm object-cover" />
                      )}
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">¥{product.price}</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${product.isPublished ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-500"}`}>
                      {product.isPublished ? "已上架" : "已下架"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <Link href={`/admin/products/${product.id}/edit`} className="text-[#c9a96e] hover:text-[#a8884a]">编辑</Link>
                      <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700">删除</button>
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
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-sm border border-[#e8e3de] px-3 py-1.5 text-[#7a746e] hover:bg-[#f5f0eb] disabled:opacity-40"
          >
            上一页
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`rounded-sm px-3 py-1.5 ${p === page ? "bg-[#c9a96e] text-white" : "border border-[#e8e3de] text-[#7a746e] hover:bg-[#f5f0eb]"}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-sm border border-[#e8e3de] px-3 py-1.5 text-[#7a746e] hover:bg-[#f5f0eb] disabled:opacity-40"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
