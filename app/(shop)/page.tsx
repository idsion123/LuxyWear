import { db } from "@/lib/db";
import { products, categories } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 60;

export default async function HomePage() {
  let featuredProducts: (typeof products.$inferSelect)[] = [];
  let allCategories: (typeof categories.$inferSelect)[] = [];

  try {
    [featuredProducts, allCategories] = await Promise.all([
      db
        .select()
        .from(products)
        .where(eq(products.isFeatured, true))
        .orderBy(desc(products.createdAt))
        .limit(8),
      db.select().from(categories).orderBy(asc(categories.name)),
    ]);
  } catch {
    // Database unavailable during build — render gracefully
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative flex h-[70vh] min-h-[500px] items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/banner.png')" }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center">
          <p className="mb-4 text-sm tracking-[0.3em] text-[#c9a96e]">
            NEW ARRIVAL
          </p>
          <h1 className="mb-6 font-serif text-5xl font-light tracking-wide text-white sm:text-6xl">
            优雅 · 新生
          </h1>
          <p className="mb-8 text-lg text-white/80">
            2026 夏季系列，探索新季风尚
          </p>
          <Link
            href="/products"
            className="inline-block border border-white px-10 py-3 text-sm tracking-wider text-white transition-colors hover:bg-white hover:text-[#2d2a24]"
          >
            探索新品
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-2 font-serif text-3xl text-[#2d2a24]">精选单品</h2>
          <p className="text-sm text-[#7a746e]">精心甄选，品质之选</p>
        </div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group flex flex-col items-center text-center"
            >
              <div className="relative mb-3 aspect-[3/4] overflow-hidden bg-[#f5f0eb]">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-opacity group-hover:opacity-90"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#e8e3de]">
                    LUXE
                  </div>
                )}
              </div>
              <h3 className="text-sm text-[#2d2a24]">{product.name}</h3>
              <p className="mt-1 text-sm text-[#c9a96e]">
                ¥{product.price.toString()}
              </p>
            </Link>
          ))}
        </div>

        {featuredProducts.length === 0 && (
          <div className="py-12 text-center text-sm text-[#7a746e]">
            暂无精选商品
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-2 font-serif text-3xl text-[#2d2a24]">分类浏览</h2>
            <p className="text-sm text-[#7a746e]">按品类找到您的风格</p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {allCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#faf8f5] transition-colors hover:bg-[#f5f0eb]"
              >
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                <div className="relative z-10 flex h-full w-full items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                  <span className="font-serif text-lg text-[#7a746e] transition-colors group-hover:text-white">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="mb-4 text-sm tracking-[0.3em] text-[#c9a96e]">
          ABOUT LUXE
        </p>
        <h2 className="mb-6 font-serif text-3xl text-[#2d2a24]">
          轻奢 · 不张扬
        </h2>
        <p className="leading-relaxed text-[#7a746e]">
          LUXE 致力于为现代女性打造精致而不张扬的着装体验。
          <br />
          每件单品均经过精心设计，以极简线条勾勒优雅轮廓，
          <br />
          用高级面料诠释质感，让每一位女性都能在细节中彰显品味。
        </p>
      </section>
    </div>
  );
}
