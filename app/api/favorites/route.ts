import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { favorites, products, categories, productCategories } from "@/db/schema";
import { eq, and, inArray, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  const payload = await verifyToken(token, "customer");
  return payload?.userId || null;
}

// GET /api/favorites — list favorite products with full details
export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ products: [] });

  const favRows = await db
    .select()
    .from(favorites)
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));

  if (favRows.length === 0) return NextResponse.json({ products: [] });

  const productIds = favRows.map((r) => r.productId);
  const productList = await db
    .select()
    .from(products)
    .where(inArray(products.id, productIds));

  // Build productId -> product map
  const prodMap = new Map(productList.map((p) => [p.id, p]));

  // Get category mapping
  const pcRels = await db
    .select()
    .from(productCategories)
    .where(inArray(productCategories.productId, productIds));
  const catIds = [...new Set(pcRels.map((r) => r.categoryId))];
  const catList = catIds.length > 0
    ? await db.select({ id: categories.id, name: categories.name }).from(categories).where(inArray(categories.id, catIds))
    : [];
  const catMap = new Map(catList.map((c) => [c.id, c.name]));
  const prodCatMap = new Map<string, string>();
  for (const rel of pcRels) {
    if (!prodCatMap.has(rel.productId)) {
      prodCatMap.set(rel.productId, catMap.get(rel.categoryId) || "");
    }
  }

  // Return products in favorites order
  const result = productIds.map((id) => {
    const p = prodMap.get(id);
    if (!p) return null;
    return { ...p, category: prodCatMap.get(id) || "" };
  }).filter(Boolean);

  return NextResponse.json({ products: result });
}

// POST /api/favorites — add favorite
export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { productId } = await request.json();
  if (!productId) {
    return NextResponse.json({ error: "缺少商品ID" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)))
    .limit(1);

  if (!existing) {
    await db.insert(favorites).values({ userId, productId });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/favorites — remove favorite
export async function DELETE(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { productId } = await request.json();
  if (!productId) {
    return NextResponse.json({ error: "缺少商品ID" }, { status: 400 });
  }

  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)));

  return NextResponse.json({ success: true });
}
