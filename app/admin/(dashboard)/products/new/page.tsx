"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
}
interface ColorInput {
  name: string;
  hex: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<ColorInput[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#c9a96e");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories?all=true")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const generateSlug = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9一-龥]+/g, "-").replace(/^-|-$/g, "");

  const addSize = () => {
    if (sizeInput && !sizes.includes(sizeInput)) {
      setSizes([...sizes, sizeInput.toUpperCase()]);
      setSizeInput("");
    }
  };

  const addColor = () => {
    if (colorName) {
      setColors([...colors, { name: colorName, hex: colorHex }]);
      setColorName("");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const cat = categories.find((c) => c.id === selectedCategory);
      if (cat?.slug) formData.append("dir", cat.slug);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) setImages([...images, data.url]);
      else alert(data.error);
    } catch {
      alert("上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !price) {
      setError("名称、Slug和价格为必填");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          price,
          compareAtPrice: compareAtPrice || null,
          stock: parseInt(stock),
          sizes,
          colors,
          images,
          categoryIds: selectedCategory ? [selectedCategory] : [],
        }),
      });
      if (res.ok) {
        router.push("/admin/products");
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
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-serif text-[#2d2a24]">新增商品</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-sm bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-[#7a746e]">名称 *</label>
            <input value={name} onChange={(e) => {
              setName(e.target.value);
              if (!slug || slug === generateSlug(slug)) setSlug(generateSlug(e.target.value));
            }} className="w-full rounded-sm border border-[#e8e3de] px-4 py-2.5 text-sm outline-none focus:border-[#c9a96e]" required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#7a746e]">Slug *</label>
            <input value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} className="w-full rounded-sm border border-[#e8e3de] px-4 py-2.5 text-sm outline-none focus:border-[#c9a96e]" required />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-[#7a746e]">分类</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full rounded-sm border border-[#e8e3de] px-4 py-2.5 text-sm outline-none focus:border-[#c9a96e]">
            <option value="">选择分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-[#7a746e]">描述</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded-sm border border-[#e8e3de] px-4 py-2.5 text-sm outline-none focus:border-[#c9a96e]" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm text-[#7a746e]">价格 *</label>
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-sm border border-[#e8e3de] px-4 py-2.5 text-sm outline-none focus:border-[#c9a96e]" required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#7a746e]">原价</label>
            <input type="number" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} className="w-full rounded-sm border border-[#e8e3de] px-4 py-2.5 text-sm outline-none focus:border-[#c9a96e]" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#7a746e]">库存</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full rounded-sm border border-[#e8e3de] px-4 py-2.5 text-sm outline-none focus:border-[#c9a96e]" />
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label className="mb-1 block text-sm text-[#7a746e]">尺码</label>
          <div className="flex gap-2">
            <input value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())} placeholder="输入尺码后按回车添加" className="flex-1 rounded-sm border border-[#e8e3de] px-4 py-2.5 text-sm outline-none focus:border-[#c9a96e]" />
            <button type="button" onClick={addSize} className="rounded-sm bg-[#f5f0eb] px-4 text-sm text-[#7a746e] hover:bg-[#e8e3de]">添加</button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((s) => (
              <span key={s} className="flex items-center gap-1 rounded-sm border border-[#e8e3de] px-3 py-1 text-sm">
                {s}
                <button type="button" onClick={() => setSizes(sizes.filter((x) => x !== s))} className="text-[#c46565]">&times;</button>
              </span>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div>
          <label className="mb-1 block text-sm text-[#7a746e]">颜色</label>
          <div className="flex gap-2">
            <input value={colorName} onChange={(e) => setColorName(e.target.value)} placeholder="颜色名称" className="flex-1 rounded-sm border border-[#e8e3de] px-4 py-2.5 text-sm outline-none focus:border-[#c9a96e]" />
            <input type="color" value={colorHex} onChange={(e) => setColorHex(e.target.value)} className="h-[42px] w-[42px] cursor-pointer rounded-sm border border-[#e8e3de]" />
            <button type="button" onClick={addColor} className="rounded-sm bg-[#f5f0eb] px-4 text-sm text-[#7a746e] hover:bg-[#e8e3de]">添加</button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((c, i) => (
              <span key={i} className="flex items-center gap-2 rounded-sm border border-[#e8e3de] px-3 py-1 text-sm">
                <span className="inline-block h-4 w-4 rounded-full" style={{ backgroundColor: c.hex }} />
                {c.name}
                <button type="button" onClick={() => setColors(colors.filter((_, j) => j !== i))} className="text-[#c46565]">&times;</button>
              </span>
            ))}
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="mb-1 block text-sm text-[#7a746e]">商品图片</label>
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="text-sm text-[#7a746e]" />
          {uploading && <span className="ml-2 text-sm text-[#c9a96e]">上传中...</span>}
          {images.length > 0 && (
            <div className="mt-2 flex gap-2">
              {images.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt="" className="h-20 w-20 rounded-sm object-cover" />
                  <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">&times;</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="rounded-sm bg-[#c9a96e] px-6 py-2.5 text-sm text-white hover:bg-[#a8884a] disabled:opacity-50">
            {loading ? "创建中..." : "创建"}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded-sm border border-[#e8e3de] px-6 py-2.5 text-sm text-[#7a746e] hover:bg-[#f5f0eb]">取消</button>
        </div>
      </form>
    </div>
  );
}
