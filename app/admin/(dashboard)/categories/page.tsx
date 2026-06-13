"use client";

import { useState, useEffect } from "react";
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
    fetchCategories();
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

  if (loading) return <div className="text-sm text-[#7a746e]">加载中...</div>;

  const rootCategories = categories.filter((c) => !c.parentId);
  const getChildren = (parentId: string) =>
    categories.filter((c) => c.parentId === parentId);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-serif text-[#2d2a24]">分类管理</h1>
        <Link
          href="/admin/categories/new"
          className="rounded-sm bg-[#c9a96e] px-4 py-2 text-sm text-white hover:bg-[#a8884a]"
        >
          新增分类
        </Link>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#e8e3de] text-[#7a746e]">
              <th className="px-6 py-4 font-medium">名称</th>
              <th className="px-6 py-4 font-medium">Slug</th>
              <th className="px-6 py-4 font-medium">描述</th>
              <th className="px-6 py-4 font-medium">操作</th>
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
                <td colSpan={4} className="px-6 py-8 text-center text-[#7a746e]">
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
      <tr className="border-b border-[#e8e3de] last:border-0">
        <td
          className="px-6 py-4"
          style={{ paddingLeft: `${24 + depth * 24}px` }}
        >
          {depth > 0 && (
            <span className="mr-2 text-[#c9a96e]">└</span>
          )}
          {category.name}
        </td>
        <td className="px-6 py-4 text-[#7a746e]">{category.slug}</td>
        <td className="px-6 py-4 text-[#7a746e]">{category.description || "-"}</td>
        <td className="px-6 py-4">
          <button
            onClick={() => onDelete(category.id)}
            className="text-sm text-red-500 hover:text-red-700"
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
