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

  if (category) {
    const [cat] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, category))
      .limit(1);

    if (cat) {
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

  const pageHeaderTitle = category
    ? allCategories.find((c) => c.slug === category)?.name || "商品"
    : "全部商品";

  return (
    <div>
      {/* Page Header */}
      <div className="relative border-b border-[#e8e3de] bg-[#faf8f5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-12 text-center lg:py-16">
            <span className="mb-3 block text-xs tracking-[0.3em] text-[#c9a96e] uppercase">
              {category ? "CATEGORY" : "COLLECTION"}
            </span>
            <h1 className="font-serif text-4xl tracking-wide text-[#2d2a24] lg:text-5xl">
              {pageHeaderTitle}
            </h1>
            <div className="mx-auto mt-4 h-px w-12 bg-[#c9a96e]" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Filters */}
          <aside className="w-full shrink-0 lg:w-60">
            <div className="border border-[#e8e3de] bg-white p-6">
              <h3 className="mb-4 text-xs tracking-[0.2em] text-[#2d2a24] uppercase">
                分类
              </h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/products"
                    className={`relative block py-2 pl-3 text-sm transition-colors ${
                      !category
                        ? "border-l-2 border-[#c9a96e] pl-[10px] font-medium text-[#c9a96e]"
                        : "border-l border-[#e8e3de] text-[#7a746e] hover:border-[#c9a96e] hover:text-[#2d2a24]"
                    }`}
                  >
                    全部
                  </Link>
                </li>
                {allCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className={`relative block py-2 pl-3 text-sm transition-colors ${
                        category === cat.slug
                          ? "border-l-2 border-[#c9a96e] pl-[10px] font-medium text-[#c9a96e]"
                          : "border-l border-[#e8e3de] text-[#7a746e] hover:border-[#c9a96e] hover:text-[#2d2a24]"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="my-6 border-t border-[#e8e3de]" />

              <h3 className="mb-4 text-xs tracking-[0.2em] text-[#2d2a24] uppercase">
                搜索
              </h3>
              <form method="GET" action="/products">
                {category && (
                  <input type="hidden" name="category" value={category} />
                )}
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a746e]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                    />
                  </svg>
                  <input
                    type="text"
                    name="search"
                    defaultValue={search}
                    placeholder="搜索商品..."
                    className="w-full border border-[#e8e3de] py-2.5 pl-10 pr-4 text-sm text-[#2d2a24] outline-none transition-colors focus:border-[#c9a96e] placeholder:text-[#7a746e]/60"
                  />
                </div>
              </form>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="mb-8 flex flex-col gap-3 border-b border-[#e8e3de] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs tracking-[0.1em] text-[#7a746e] uppercase">
                共 <span className="text-[#c9a96e]">{count}</span> 件商品
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
                    isNav
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
                    isNav
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
  isNav,
}: {
  label: string;
  page: number;
  current?: boolean;
  category?: string;
  search?: string;
  sort?: string;
  isNav?: boolean;
}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (search) params.set("search", search);
  if (sort && sort !== "newest") params.set("sort", sort);
  params.set("page", String(page));

  if (isNav) {
    return (
      <Link
        href={`/products?${params.toString()}`}
        className="flex h-9 items-center justify-center rounded-none border border-[#e8e3de] px-3.5 text-xs tracking-wider text-[#7a746e] uppercase transition-colors hover:border-[#c9a96e] hover:text-[#c9a96e]"
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={`/products?${params.toString()}`}
      className={`flex h-9 min-w-[36px] items-center justify-center rounded-none px-3 text-xs transition-colors ${
        current
          ? "bg-[#c9a96e] text-white"
          : "border border-[#e8e3de] text-[#7a746e] hover:border-[#c9a96e] hover:text-[#c9a96e]"
      }`}
    >
      {label}
    </Link>
  );
}
