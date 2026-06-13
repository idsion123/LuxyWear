import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productCategories, categoryImages } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { categoryId } = await request.json();
    if (!categoryId) {
      return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
    }

    // 1. Get all pool images for this category
    const pool = await db
      .select({ url: categoryImages.url })
      .from(categoryImages)
      .where(eq(categoryImages.categoryId, categoryId));

    if (pool.length === 0) {
      return NextResponse.json({ error: "该分类没有图片池，请先上传图片" }, { status: 400 });
    }

    const imageUrls = pool.map((i) => i.url);

    // 2. Get all product IDs in this category
    const rels = await db
      .select({ productId: productCategories.productId })
      .from(productCategories)
      .where(eq(productCategories.categoryId, categoryId));

    if (rels.length === 0) {
      return NextResponse.json({ error: "该分类下没有商品" }, { status: 400 });
    }

    const productIds = rels.map((r) => r.productId);

    // 3. Assign images round-robin
    const updates = productIds.map((productId, index) => ({
      id: productId,
      images: [imageUrls[index % imageUrls.length]],
    }));

    // 4. Batch update
    let updated = 0;
    for (const update of updates) {
      await db
        .update(products)
        .set({ images: update.images })
        .where(eq(products.id, update.id));
      updated++;
    }

    return NextResponse.json({
      success: true,
      updated,
      poolSize: imageUrls.length,
    });
  } catch (error) {
    console.error("Assign images error:", error);
    return NextResponse.json({ error: "分配失败" }, { status: 500 });
  }
}
