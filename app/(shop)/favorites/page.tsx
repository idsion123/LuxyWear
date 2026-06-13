"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/store/auth-context";

interface FavProduct {
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

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<FavProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }

    try {
      const res = await fetch("/api/favorites");
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Re-fetch when page gains focus (user may have added/removed elsewhere)
  useEffect(() => {
    const onFocus = () => { if (user) fetchFavorites(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user, fetchFavorites]);

  const removeFav = async (productId: string) => {
    setRemoving(productId);
    try {
      await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch {}
    setRemoving(null);
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-sm text-[#7a746e]">
        加载中...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="mb-6 text-sm text-[#7a746e]">请先登录以查看收藏</p>
        <Link href="/auth/login" className="text-[#c9a96e] hover:text-[#a8884a]">
          去登录
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-serif text-3xl text-[#2d2a24]">我的收藏</h1>

      {products.length === 0 ? (
        <div className="py-16 text-center">
          <p className="mb-6 text-sm text-[#7a746e]">还没有收藏的商品</p>
          <Link href="/products" className="text-[#c9a96e] hover:text-[#a8884a]">
            去逛逛
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              <Link
                href={`/products/${product.slug}`}
                className="flex flex-col"
              >
                <div className="mb-3 aspect-[3/4] overflow-hidden bg-[#f5f0eb]">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#e8e3de]">
                      LUXE
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col items-center px-1 text-center">
                  {product.category && (
                    <span className="mb-1 text-xs text-[#c9a96e]">
                      {product.category}
                    </span>
                  )}
                  <h3 className="mb-2 text-sm leading-snug text-[#2d2a24]">
                    {product.name}
                  </h3>
                  <div className="mt-auto text-sm text-[#c9a96e]">
                    ¥{product.price}
                  </div>
                  {product.colors?.length > 0 && (
                    <div className="mt-2 flex justify-center gap-1">
                      {product.colors.map((c, i) => (
                        <span
                          key={i}
                          className="inline-block h-3 w-3 rounded-full border border-[#e8e3de]"
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Link>

              {/* Remove button */}
              <button
                onClick={() => removeFav(product.id)}
                disabled={removing === product.id}
                className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#7a746e] opacity-0 shadow-sm transition-all hover:bg-white hover:text-red-400 group-hover:opacity-100"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
