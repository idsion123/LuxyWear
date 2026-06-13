import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!product) {
    return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  }

  // Get categories
  const cats = await db
    .select({ categoryId: productCategories.categoryId })
    .from(productCategories)
    .where(eq(productCategories.productId, id));

  return NextResponse.json({ product, categoryIds: cats.map((c) => c.categoryId) });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { categoryIds, ...productData } = body;

    await db.update(products).set(productData).where(eq(products.id, id));

    // Update category links
    if (categoryIds) {
      await db.delete(productCategories).where(eq(productCategories.productId, id));
      if (categoryIds.length > 0) {
        await db.insert(productCategories).values(
          categoryIds.map((categoryId: string) => ({
            productId: id,
            categoryId,
          }))
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "更新商品失败" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(products).where(eq(products.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "删除商品失败" }, { status: 500 });
  }
}
