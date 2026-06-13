import Link from "next/link";
import Image from "next/image";

interface Product {
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

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="mb-4 text-4xl text-[#e8e3de]">✦</div>
        <p className="text-sm tracking-widest text-[#7a746e] uppercase">
          没有找到符合条件的商品
        </p>
        <p className="mt-1 text-xs text-[#c9a96e]">NO PRODUCTS FOUND</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.slug}`}
          className="group flex flex-col"
        >
          <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-[#f5f0eb] shadow-sm transition-shadow duration-500 group-hover:shadow-lg">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-all duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[#e8e3de] tracking-[0.3em]">
                LUXE
              </div>
            )}
            {product.compareAtPrice && (
              <span className="absolute left-3 top-3 bg-[#c9a96e] px-2.5 py-1 text-[10px] tracking-wider text-white uppercase">
                SALE
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col items-center text-center px-1">
            {product.category && (
              <span className="mb-1.5 inline-block text-[11px] tracking-[0.15em] text-[#c9a96e] uppercase">
                {product.category}
              </span>
            )}
            <h3 className="mb-2.5 text-sm leading-relaxed text-[#2d2a24] transition-colors duration-300 group-hover:text-[#c9a96e]">
              {product.name}
            </h3>
            <div className="mt-auto flex items-center justify-center gap-2.5">
              <span className="text-sm font-medium tracking-wide text-[#c9a96e]">
                ¥{product.price}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-[#7a746e] line-through decoration-[#7a746e]/60">
                  ¥{product.compareAtPrice}
                </span>
              )}
            </div>
            {product.colors && product.colors.length > 0 && (
              <div className="mt-3 flex justify-center gap-1.5">
                {product.colors.map((c, i) => (
                  <span
                    key={i}
                    className="inline-block h-3 w-3 rounded-full border border-[#e8e3de] transition-transform duration-200 hover:scale-125"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
