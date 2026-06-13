"use client";

import { useState, useEffect, startTransition } from "react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories?all=true");
      const data = await res.json();
      setCategories(data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startTransition(() => {
      fetchCategories();
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此分类？")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16 text-sm text-[#7a746e]">
      加载中...
    </div>
  );

  const rootCategories = categories.filter((c) => !c.parentId);
  const getChildren = (parentId: string) =>
    categories.filter((c) => c.parentId === parentId);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-[#2d2a24]">分类管理</h1>
          <p className="mt-1 text-sm text-[#7a746e]">共 {categories.length} 个分类</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-1.5 border border-[#c9a96e] bg-[#c9a96e] px-4 py-2 text-sm text-white transition-colors hover:bg-[#a8884a] hover:border-[#a8884a]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          新增分类
        </Link>
      </div>

      <div className="overflow-x-auto border border-[#e8e3de] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#e8e3de] bg-[#faf8f5]">
              <th className="px-5 py-3.5 text-xs font-medium tracking-wider text-[#7a746e] uppercase">名称</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wider text-[#7a746e] uppercase">Slug</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wider text-[#7a746e] uppercase">描述</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wider text-[#7a746e] uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {rootCategories.map((cat) => (
              <CategoryRow
                key={cat.id}
                category={cat}
                onDelete={handleDelete}
                depth={0}
                getChildren={getChildren}
              />
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-sm text-[#7a746e]">
                  暂无分类
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoryRow({
  category,
  onDelete,
  depth,
  getChildren,
}: {
  category: Category;
  onDelete: (id: string) => void;
  depth: number;
  getChildren: (parentId: string) => Category[];
}) {
  const children = getChildren(category.id);

  return (
    <>
      <tr className="border-b border-[#e8e3de] last:border-0 hover:bg-[#faf8f5]/50">
        <td
          className="px-5 py-4 font-medium text-[#2d2a24]"
          style={{ paddingLeft: `${20 + depth * 24}px` }}
        >
          {depth > 0 && (
            <span className="mr-2 text-[#c9a96e]">└</span>
          )}
          {category.name}
        </td>
        <td className="px-5 py-4 text-[#7a746e]">{category.slug}</td>
        <td className="px-5 py-4 text-[#7a746e]">{category.description || "—"}</td>
        <td className="px-5 py-4">
          <button
            onClick={() => onDelete(category.id)}
            className="text-xs tracking-wider text-red-400 transition-colors hover:text-red-600 uppercase"
          >
            删除
          </button>
        </td>
      </tr>
      {children.map((child) => (
        <CategoryRow
          key={child.id}
          category={child}
          onDelete={onDelete}
          depth={depth + 1}
          getChildren={getChildren}
        />
      ))}
    </>
  );
}
