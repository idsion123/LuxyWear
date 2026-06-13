"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-[#2d2a24]">新增商品</h1>
        <p className="mt-1 text-sm text-[#7a746e]">填写商品信息</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="border border-[#e8e3de] bg-white p-6 space-y-5">
          <h3 className="text-xs font-medium tracking-wider text-[#2d2a24] uppercase border-b border-[#e8e3de] pb-3">基本信息</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs tracking-wider text-[#7a746e] uppercase">名称 *</label>
              <input value={name} onChange={(e) => {
                setName(e.target.value);
                if (!slug || slug === generateSlug(slug)) setSlug(generateSlug(e.target.value));
              }} className="w-full border border-[#e8e3de] px-4 py-2.5 text-sm text-[#2d2a24] outline-none transition-colors focus:border-[#c9a96e] placeholder:text-[#7a746e]/60" required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs tracking-wider text-[#7a746e] uppercase">Slug *</label>
              <input value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} className="w-full border border-[#e8e3de] px-4 py-2.5 text-sm text-[#2d2a24] outline-none transition-colors focus:border-[#c9a96e]" required />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs tracking-wider text-[#7a746e] uppercase">分类</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-[#e8e3de] bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%228%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M1%201.5l5%205%205-5%22%20stroke%3D%22%237a746e%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[right_12px_center] bg-no-repeat px-4 py-2.5 pr-10 text-sm text-[#2d2a24] outline-none transition-colors focus:border-[#c9a96e]">
              <option value="">选择分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs tracking-wider text-[#7a746e] uppercase">描述</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
              className="w-full border border-[#e8e3de] px-4 py-2.5 text-sm text-[#2d2a24] outline-none transition-colors focus:border-[#c9a96e] placeholder:text-[#7a746e]/60 resize-none" />
          </div>
        </div>

        <div className="border border-[#e8e3de] bg-white p-6 space-y-5">
          <h3 className="text-xs font-medium tracking-wider text-[#2d2a24] uppercase border-b border-[#e8e3de] pb-3">价格与库存</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs tracking-wider text-[#7a746e] uppercase">价格 *</label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-[#e8e3de] px-4 py-2.5 text-sm text-[#2d2a24] outline-none transition-colors focus:border-[#c9a96e]" required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs tracking-wider text-[#7a746e] uppercase">原价</label>
              <input type="number" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)}
                className="w-full border border-[#e8e3de] px-4 py-2.5 text-sm text-[#2d2a24] outline-none transition-colors focus:border-[#c9a96e]" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs tracking-wider text-[#7a746e] uppercase">库存</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)}
                className="w-full border border-[#e8e3de] px-4 py-2.5 text-sm text-[#2d2a24] outline-none transition-colors focus:border-[#c9a96e]" />
            </div>
          </div>
        </div>

        <div className="border border-[#e8e3de] bg-white p-6 space-y-5">
          <h3 className="text-xs font-medium tracking-wider text-[#2d2a24] uppercase border-b border-[#e8e3de] pb-3">规格</h3>

          {/* Sizes */}
          <div>
            <label className="mb-1.5 block text-xs tracking-wider text-[#7a746e] uppercase">尺码</label>
            <div className="flex gap-2">
              <input value={sizeInput} onChange={(e) => setSizeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
                placeholder="输入尺码后按回车添加"
                className="flex-1 border border-[#e8e3de] px-4 py-2.5 text-sm text-[#2d2a24] outline-none transition-colors focus:border-[#c9a96e] placeholder:text-[#7a746e]/60" />
              <button type="button" onClick={addSize}
                className="border border-[#e8e3de] px-4 text-sm text-[#7a746e] transition-colors hover:border-[#c9a96e] hover:text-[#c9a96e]">
                添加
              </button>
            </div>
            {sizes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 border border-[#e8e3de] bg-[#faf8f5] px-3 py-1.5 text-sm text-[#2d2a24]">
                    {s}
                    <button type="button" onClick={() => setSizes(sizes.filter((x) => x !== s))}
                      className="text-[#c46565] transition-colors hover:text-red-600">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Colors */}
          <div>
            <label className="mb-1.5 block text-xs tracking-wider text-[#7a746e] uppercase">颜色</label>
            <div className="flex gap-2">
              <input value={colorName} onChange={(e) => setColorName(e.target.value)}
                placeholder="颜色名称"
                className="flex-1 border border-[#e8e3de] px-4 py-2.5 text-sm text-[#2d2a24] outline-none transition-colors focus:border-[#c9a96e] placeholder:text-[#7a746e]/60" />
              <input type="color" value={colorHex} onChange={(e) => setColorHex(e.target.value)}
                className="h-[42px] w-[42px] cursor-pointer border border-[#e8e3de]" />
              <button type="button" onClick={addColor}
                className="border border-[#e8e3de] px-4 text-sm text-[#7a746e] transition-colors hover:border-[#c9a96e] hover:text-[#c9a96e]">
                添加
              </button>
            </div>
            {colors.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {colors.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-2 border border-[#e8e3de] bg-[#faf8f5] px-3 py-1.5 text-sm text-[#2d2a24]">
                    <span className="inline-block h-4 w-4 rounded-full border border-[#e8e3de]" style={{ backgroundColor: c.hex }} />
                    {c.name}
                    <button type="button" onClick={() => setColors(colors.filter((_, j) => j !== i))}
                      className="text-[#c46565] transition-colors hover:text-red-600">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border border-[#e8e3de] bg-white p-6 space-y-4">
          <h3 className="text-xs font-medium tracking-wider text-[#2d2a24] uppercase border-b border-[#e8e3de] pb-3">商品图片</h3>

          <div>
            <label className="relative inline-flex cursor-pointer items-center gap-2 border border-[#e8e3de] px-4 py-2.5 text-sm text-[#7a746e] transition-colors hover:border-[#c9a96e] hover:text-[#c9a96e]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              上传图片
              <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="absolute inset-0 cursor-pointer opacity-0" />
            </label>
            {uploading && <span className="ml-3 text-sm text-[#c9a96e]">上传中...</span>}
          </div>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {images.map((url, i) => (
                <div key={i} className="group relative h-20 w-20 overflow-hidden border border-[#e8e3de]">
                  <Image src={url} alt="" fill className="object-cover" />
                  <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-[#e8e3de] pt-6">
          <button type="submit" disabled={loading}
            className="border border-[#c9a96e] bg-[#c9a96e] px-6 py-2.5 text-sm text-white transition-colors hover:bg-[#a8884a] hover:border-[#a8884a] disabled:opacity-50">
            {loading ? "创建中..." : "创建"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="border border-[#e8e3de] px-6 py-2.5 text-sm text-[#7a746e] transition-colors hover:border-[#c9a96e] hover:text-[#c9a96e]">
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
