"use client";

import { useState, useEffect, useCallback, startTransition } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PoolImage {
  id: string;
  url: string;
}

export default function BulkImagesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories?all=true")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-[#7a746e]">加载中...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-[#2d2a24]">批量图片管理</h1>
        <p className="mt-1 text-sm text-[#7a746e]">
          为每个分类上传图片，然后一键分配给该分类下的所有商品
        </p>
      </div>

      <div className="space-y-8">
        {categories.map((cat) => (
          <CategorySection key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
}

function CategorySection({ category }: { category: Category }) {
  const [images, setImages] = useState<PoolImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState("");

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch(`/api/category-images?categoryId=${category.id}`);
      const data = await res.json();
      setImages(data.images || []);
    } catch {
      setMessage("加载图片失败");
    } finally {
      setLoading(false);
    }
  }, [category.id]);

  useEffect(() => {
    startTransition(() => {
      fetchImages();
    });
  }, [fetchImages]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dir", category.slug);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setMessage(uploadData.error || "上传失败");
        return;
      }

      const addRes = await fetch("/api/category-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: category.id, url: uploadData.url }),
      });
      const addData = await addRes.json();
      if (addRes.ok) {
        setImages((prev) => [...prev, addData.image]);
      } else {
        setMessage(addData.error || "添加到图片池失败");
      }
    } catch {
      setMessage("上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm("确定移除此图片？")) return;
    try {
      const res = await fetch(`/api/category-images?id=${imageId}`, { method: "DELETE" });
      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
      } else {
        setMessage("删除失败");
      }
    } catch {
      setMessage("删除失败");
    }
  };

  const handleAssign = async () => {
    if (images.length === 0) {
      setMessage("请先上传图片");
      return;
    }
    setAssigning(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/products/assign-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: category.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`已分配 ${data.updated} 件商品`);
      } else {
        setMessage(data.error || "分配失败");
      }
    } catch {
      setMessage("分配失败");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="border border-[#e8e3de] bg-white">
      {/* Category Header */}
      <div className="flex items-center justify-between border-b border-[#e8e3de] px-5 py-4">
        <h2 className="text-base font-serif text-[#2d2a24]">{category.name}</h2>
        <div className="flex items-center gap-3">
          <label className="relative inline-flex cursor-pointer items-center gap-1.5 border border-[#c9a96e] px-3 py-1.5 text-xs tracking-wider text-[#c9a96e] transition-colors hover:bg-[#c9a96e] hover:text-white">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            {uploading ? "上传中..." : "上传图片"}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
          <button
            onClick={handleAssign}
            disabled={assigning || images.length === 0}
            className="border border-[#c9a96e] bg-[#c9a96e] px-4 py-1.5 text-xs tracking-wider text-white transition-colors hover:bg-[#a8884a] disabled:opacity-50"
          >
            {assigning ? "分配中..." : "分配图片"}
          </button>
        </div>
      </div>

      {/* Image Pool */}
      <div className="px-5 py-4">
        {loading ? (
          <div className="py-8 text-center text-sm text-[#7a746e]">加载中...</div>
        ) : images.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#7a746e]">
            暂无图片，请上传
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {images.map((img) => (
              <div key={img.id} className="group relative h-24 w-24 overflow-hidden border border-[#e8e3de]">
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => handleDelete(img.id)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        {message && (
          <div className={`mt-3 text-sm ${message.includes("已分配") ? "text-green-600" : "text-red-500"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
