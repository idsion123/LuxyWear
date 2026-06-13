import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/db/schema";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all");

  const list = await db
    .select()
    .from(categories)
    .orderBy(categories.createdAt);

  if (all === "true") {
    return NextResponse.json({ categories: list });
  }

  const root = list.filter((c) => !c.parentId);
  return NextResponse.json({ categories: root });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, parentId } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "名称和Slug为必填" },
        { status: 400 }
      );
    }

    const [{ insertId }] = await db.insert(categories).values({
      name,
      slug,
      description,
      parentId: parentId || undefined,
    });

    return NextResponse.json({ id: insertId }, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json({ error: "创建分类失败" }, { status: 500 });
  }
}
