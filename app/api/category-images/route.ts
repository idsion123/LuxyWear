import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categoryImages } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/category-images?categoryId=xxx — list images in pool
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  if (!categoryId) {
    return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
  }

  const images = await db
    .select()
    .from(categoryImages)
    .where(eq(categoryImages.categoryId, categoryId))
    .orderBy(categoryImages.createdAt);

  return NextResponse.json({ images });
}

// POST /api/category-images — add image URL to pool
export async function POST(request: Request) {
  const { categoryId, url } = await request.json();
  if (!categoryId || !url) {
    return NextResponse.json({ error: "categoryId and url are required" }, { status: 400 });
  }

  const [image] = await db
    .insert(categoryImages)
    .values({ categoryId, url })
    .returning();

  return NextResponse.json({ image });
}

// DELETE /api/category-images?id=xxx — remove image from pool
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.delete(categoryImages).where(eq(categoryImages.id, id));
  return NextResponse.json({ success: true });
}
