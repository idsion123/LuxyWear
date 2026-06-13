import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productCategories } from "@/db/schema";
import { eq, like, desc, asc, and, sql, inArray } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "newest";
  const maxPrice = searchParams.get("maxPrice");
  const admin = searchParams.get("admin") === "true";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const offset = (page - 1) * limit;

  const conditions = [];

  if (!admin) {
    conditions.push(eq(products.isPublished, true));
  }

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

  // If category filter, first get product IDs in that category
  if (category) {
    const pc = await db
      .select({ productId: productCategories.productId })
      .from(productCategories)
      .where(eq(productCategories.categoryId, category));

    if (pc.length === 0) {
      return NextResponse.json({ products: [], total: 0, page, limit }, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
      });
    }

    conditions.push(
      inArray(products.id, pc.map((p) => p.productId))
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [list, countResult] = await Promise.all([
    db
      .select()
      .from(products)
      .where(where)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(where)
      .then((r) => Number(r[0]?.count ?? 0)),
  ]);

  return NextResponse.json({ products: list, total: countResult, page, limit }, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, price, compareAtPrice, stock, sizes, colors, categoryIds, isFeatured } = body;

    if (!name || !slug || !price) {
      return NextResponse.json(
        { error: "名称、Slug和价格为必填" },
        { status: 400, headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
      );
    }

    const [newProduct] = await db
      .insert(products)
      .values({
        name,
        slug,
        description: description || "",
        price,
        compareAtPrice: compareAtPrice || null,
        stock: stock || 0,
        sizes: sizes || [],
        colors: colors || [],
        isFeatured: isFeatured || false,
      })
      .returning({ id: products.id });

    // Link categories
    if (categoryIds && categoryIds.length > 0) {
      await db.insert(productCategories).values(
        categoryIds.map((categoryId: string) => ({
          productId: newProduct.id,
          categoryId,
        }))
      );
    }

    return NextResponse.json({ id: newProduct.id }, {
      status: 201,
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "创建商品失败" }, {
      status: 500,
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  }
}
