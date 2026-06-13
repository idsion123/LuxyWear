import { db } from "@/lib/db";
import { products, categories, productCategories } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./ProductDetailClient";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product) {
    notFound();
  }

  // Fetch category info
  const [rel] = await db
    .select({ categoryId: productCategories.categoryId })
    .from(productCategories)
    .where(eq(productCategories.productId, product.id))
    .limit(1);

  let categoryName = "";
  let categorySlug = "";
  let relatedProducts: (typeof products.$inferSelect)[] = [];
  if (rel) {
    const [cat] = await db
    .select({ name: categories.name, slug: categories.slug })
      .from(categories)
    .where(eq(categories.id, rel.categoryId))
      .limit(1);
    if (cat) {
      categoryName = cat.name;
      categorySlug = cat.slug;
    }

    // Related products from same category (exclude current product)
    const sameCat = await db
      .select({ productId: productCategories.productId })
      .from(productCategories)
      .where(eq(productCategories.categoryId, rel.categoryId));
    const siblingIds = sameCat
      .map((r) => r.productId)
      .filter((id) => id !== product.id)
      .slice(0, 4);
    if (siblingIds.length > 0) {
      relatedProducts = await db
        .select()
        .from(products)
        .where(inArray(products.id, siblingIds));
    }
  }

  return (
    <ProductDetailClient
      product={{ ...product, category: categoryName, categorySlug }}
      relatedProducts={relatedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stock: p.stock,
        images: p.images,
        sizes: p.sizes,
        colors: p.colors,
        category: categoryName,
      }))}
    />
  );
}
