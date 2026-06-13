import Link from "next/link";

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
      <div className="py-16 text-center text-sm text-[#7a746e]">
        没有找到符合条件的商品
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.slug}`}
          className="group flex flex-col"
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
          <div className="flex flex-1 flex-col items-center text-center px-1">
            {product.category && (
              <span className="mb-1 inline-block text-xs text-[#c9a96e]">
                {product.category}
              </span>
            )}
            <h3 className="mb-2 text-sm leading-snug text-[#2d2a24]">
              {product.name}
            </h3>
            <div className="mt-auto flex items-center justify-center gap-2">
              <span className="text-sm text-[#c9a96e]">
                ¥{product.price}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-[#7a746e] line-through">
                  ¥{product.compareAtPrice}
                </span>
              )}
            </div>
            {product.colors && product.colors.length > 0 && (
              <div className="mt-2 flex justify-center gap-1">
                {product.colors.map((c, i) => (
                  <span
                    key={i}
                    className="inline-block h-3 w-3 rounded-full border border-[#e8e3de]"
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
