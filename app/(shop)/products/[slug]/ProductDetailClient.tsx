"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth-context";
import { useCart } from "@/store/cart-context";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  compareAtPrice: string | null;
  stock: number;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  category?: string;
  categorySlug?: string;
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: string;
  compareAtPrice: string | null;
  stock: number;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  category?: string;
}

export function ProductDetailClient({
  product,
  relatedProducts = [],
}: {
  product: Product;
  relatedProducts?: RelatedProduct[];
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [isFav, setIsFav] = useState(false);
  const [favToggling, setFavToggling] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => {
        const ids = data.products?.map((p: { id: string }) => p.id) || [];
        setIsFav(ids.includes(product.id));
      })
      .catch(() => {});
  }, [user, product.id]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const toggleFav = async () => {
    if (!user) { router.push("/auth/login"); return; }
    setFavToggling(true);
    try {
      if (isFav) {
        await fetch("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        showToast("已取消收藏");
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        showToast("已收藏");
      }
      setIsFav(!isFav);
    } catch {}
    setFavToggling(false);
  };

  const images = product.images?.length
    ? product.images
    : [""];

  const handleAddToCart = async () => {
    if (!loading && !user) {
      router.push("/auth/login");
      return;
    }

    if (product.sizes?.length && !selectedSize) {
      showToast("请选择尺码");
      return;
    }
    if (product.colors?.length && !selectedColor) {
      showToast("请选择颜色");
      return;
    }

    setAdding(true);
    try {
      await addItem({
        productId: product.id,
        quantity,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      });
      showToast("已加入购物车");
    } catch {
      // silent
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 text-sm text-[#7a746e]">
        <Link href="/" className="hover:text-[#c9a96e]">
          首页
        </Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-[#c9a96e]">
          商品
        </Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/products?category=${product.categorySlug || ""}`}
              className="hover:text-[#c9a96e]"
            >
              {product.category}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-[#2d2a24]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div>
          <div className="mb-4 aspect-[3/4] overflow-hidden bg-[#f5f0eb]">
            {images[selectedImage] ? (
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[#e8e3de]">
                LUXE
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-20 w-20 overflow-hidden rounded-sm border-2 ${
                    i === selectedImage
                      ? "border-[#c9a96e]"
                      : "border-transparent"
                  }`}
                >
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#f5f0eb] text-xs text-[#e8e3de]">
                      LUXE
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="lg:pl-8">
          <h1 className="mb-2 font-serif text-3xl text-[#2d2a24]">
            {product.name}
          </h1>

          <div className="mb-6 flex items-center gap-3">
            <span className="text-2xl text-[#c9a96e]">
              ¥{product.price}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-[#7a746e] line-through">
                ¥{product.compareAtPrice}
              </span>
            )}
          </div>

          <div className="mb-6">
            <p className="text-sm leading-relaxed text-[#7a746e]">
              {product.description}
            </p>
          </div>

          {/* Size Selector */}
          {product.sizes?.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-medium text-[#2d2a24]">
                尺码
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] rounded-sm border px-4 py-2 text-sm transition-colors ${
                      selectedSize === size
                        ? "border-[#c9a96e] bg-[#c9a96e] text-white"
                        : "border-[#e8e3de] text-[#7a746e] hover:border-[#c9a96e]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors?.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-medium text-[#2d2a24]">
                颜色
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`flex items-center gap-2 rounded-sm border px-3 py-2 text-sm transition-colors ${
                      selectedColor === color.name
                        ? "border-[#c9a96e]"
                        : "border-[#e8e3de] hover:border-[#c9a96e]"
                    }`}
                  >
                    <span
                      className="inline-block h-4 w-4 rounded-full border border-[#e8e3de]"
                      style={{ backgroundColor: color.hex }}
                    />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-[#2d2a24]">数量</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#e8e3de] text-[#7a746e] transition-colors hover:border-[#c9a96e]"
              >
                -
              </button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#e8e3de] text-[#7a746e] transition-colors hover:border-[#c9a96e]"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart + Favorite */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || adding}
              className="flex-1 rounded-sm bg-[#c9a96e] py-3 text-sm text-white transition-colors hover:bg-[#a8884a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {product.stock === 0
                ? "暂时缺货"
                : adding
                ? "加入中..."
                : "加入购物车"}
            </button>
            <button
              onClick={toggleFav}
              disabled={favToggling}
              className={`flex h-11 w-11 items-center justify-center rounded-sm border transition-colors ${
                isFav
                  ? "border-red-200 bg-red-50 text-red-400"
                  : "border-[#e8e3de] text-[#7a746e] hover:border-[#c9a96e]"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill={isFav ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {product.stock > 0 && product.stock < 10 && (
            <p className="mt-2 text-xs text-[#c46565]">
              仅剩 {product.stock} 件
            </p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-[#e8e3de] pt-12">
          <h2 className="mb-8 text-center font-serif text-2xl text-[#2d2a24]">
            你可能还喜欢
          </h2>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {relatedProducts.map((rp) => (
              <Link
                key={rp.id}
                href={`/products/${rp.slug}`}
                className="group flex flex-col items-center text-center"
              >
                <div className="mb-3 aspect-[3/4] w-full overflow-hidden bg-[#f5f0eb]">
                  {rp.images?.[0] ? (
                    <img
                      src={rp.images[0]}
                      alt={rp.name}
                      className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#e8e3de]">
                      LUXE
                    </div>
                  )}
                </div>
                {rp.category && (
                  <span className="mb-1 text-xs text-[#c9a96e]">{rp.category}</span>
                )}
                <span className="text-sm text-[#2d2a24]">{rp.name}</span>
                <span className="mt-1 text-sm text-[#c9a96e]">¥{rp.price}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 animate-bounce rounded-sm bg-[#2d2a24] px-6 py-3 text-sm text-white shadow-lg">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
