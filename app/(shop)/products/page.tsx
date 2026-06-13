import { db } from "@/lib/db";
import { products, categories, productCategories } from "@/db/schema";
import { eq, like, desc, asc, and, sql, inArray } from "drizzle-orm";
import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SortSelect } from "@/components/product/SortSelect";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category;
  const search = params.search;
  const sort = params.sort || "newest";
  const maxPrice = params.maxPrice;
  const page = Math.max(1, parseInt(params.page || "1"));
  const limit = 24;

  const conditions = [eq(products.isPublished, true)];

  if (search) {
    conditions.push(like(products.name, `%${search}%`));
  }

  if (maxPrice) {
    conditions.push(sql`${products.price} <= ${maxPrice}`);
  }

  let orderBy;
  switch (sort) {
    case "price_asc":
      orderBy = [asc(products.price)];
      break;
    case "price_desc":
      orderBy = [desc(products.price)];
      break;
    case "name_asc":
      orderBy = [asc(products.name)];
      break;
    default:
      orderBy = [desc(products.createdAt)];
  }

  // If category filter, find by slug (include child categories)
  if (category) {
    const [cat] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, category))
      .limit(1);

    if (cat) {
      // Get all matching category IDs (parent + children)
      const childCats = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.parentId, cat.id));
      const catIds = [cat.id, ...childCats.map((c) => c.id)];

      const pc = await db
        .select({ productId: productCategories.productId })
        .from(productCategories)
        .where(inArray(productCategories.categoryId, catIds));

      if (pc.length > 0) {
        conditions.push(inArray(products.id, [...new Set(pc.map((p) => p.productId))]));
      } else {
        conditions.push(sql`1=0`);
      }
    }
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(and(...conditions));
  const totalPages = Math.ceil(count / limit);

  const productList = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(...orderBy)
    .limit(limit)
    .offset((page - 1) * limit);

  // Attach category names to products
  const productIds = productList.map((p) => p.id);
  const pcRels =
    productIds.length > 0
      ? await db
          .select()
          .from(productCategories)
          .where(inArray(productCategories.productId, productIds))
      : [];
  const categoryIds = [...new Set(pcRels.map((r) => r.categoryId))];
  const catList =
    categoryIds.length > 0
      ? await db
          .select({ id: categories.id, name: categories.name })
          .from(categories)
          .where(inArray(categories.id, categoryIds))
      : [];
  const catMap = new Map(catList.map((c) => [c.id, c.name]));
  const productCatMap = new Map<string, string>();
  for (const rel of pcRels) {
    if (!productCatMap.has(rel.productId)) {
      productCatMap.set(rel.productId, catMap.get(rel.categoryId) || "");
    }
  }
  const productsWithCategories = productList.map((p) => ({
    ...p,
    category: productCatMap.get(p.id) || "",
  }));

  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.name));

  return (
    <div>
      {/* Page Header */}
      <div className="border-b border-[#e8e3de] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl text-[#2d2a24]">
            {category
              ? allCategories.find((c) => c.slug === category)?.name || "商品"
              : "全部商品"}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar Filters */}
          <aside className="w-full shrink-0 lg:w-56">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-medium text-[#2d2a24]">分类</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/products"
                    className={`text-sm transition-colors ${
                      !category
                        ? "text-[#c9a96e]"
                        : "text-[#7a746e] hover:text-[#2d2a24]"
                    }`}
                  >
                    全部
                  </Link>
                </li>
                {allCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className={`text-sm transition-colors ${
                        category === cat.slug
                          ? "text-[#c9a96e]"
                          : "text-[#7a746e] hover:text-[#2d2a24]"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Search */}
              <h3 className="mb-4 mt-6 text-sm font-medium text-[#2d2a24]">
                搜索
              </h3>
              <form method="GET" action="/products">
                {category && (
                  <input type="hidden" name="category" value={category} />
                )}
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="搜索商品..."
                  className="w-full rounded-sm border border-[#e8e3de] px-3 py-2 text-sm outline-none focus:border-[#c9a96e]"
                />
              </form>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm text-[#7a746e]">
                共 {count} 件商品
              </span>
              <SortSelect currentSort={sort} category={category} search={search} />
            </div>

            <ProductGrid products={productsWithCategories} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-2">
                {page > 1 && (
                  <PageLink
                    label="上一页"
                    page={page - 1}
                    category={category}
                    search={search}
                    sort={sort}
                  />
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PageLink
                    key={p}
                    label={String(p)}
                    page={p}
                    current={p === page}
                    category={category}
                    search={search}
                    sort={sort}
                  />
                ))}
                {page < totalPages && (
                  <PageLink
                    label="下一页"
                    page={page + 1}
                    category={category}
                    search={search}
                    sort={sort}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PageLink({
  label,
  page,
  current,
  category,
  search,
  sort,
}: {
  label: string;
  page: number;
  current?: boolean;
  category?: string;
  search?: string;
  sort?: string;
}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (search) params.set("search", search);
  if (sort && sort !== "newest") params.set("sort", sort);
  params.set("page", String(page));

  return (
    <Link
      href={`/products?${params.toString()}`}
      className={`flex h-9 min-w-[36px] items-center justify-center rounded-sm px-3 text-sm transition-colors ${
        current
          ? "bg-[#c9a96e] text-white"
          : "border border-[#e8e3de] text-[#7a746e] hover:border-[#c9a96e]"
      }`}
    >
      {label}
    </Link>
  );
}
