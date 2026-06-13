import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cartItems, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  const payload = await verifyToken(token, "customer");
  return payload?.userId || null;
}

async function getCartWithProducts(userId: string) {
  const items = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      size: cartItems.size,
      color: cartItems.color,
      productName: products.name,
      price: products.price,
      image: products.images,
      stock: products.stock,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));

  return items.map((item) => ({
    ...item,
    image: Array.isArray(item.image) && item.image.length > 0 ? item.image[0] : null,
    price: item.price.toString(),
  }));
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ items: [] });
  }

  const items = await getCartWithProducts(userId);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { productId, quantity, size, color } = await request.json();

    // Check if item already exists
    const existing = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId),
          size ? eq(cartItems.size, size) : eq(cartItems.size, ""),
          color ? eq(cartItems.color, color) : eq(cartItems.color, "")
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + quantity })
        .where(eq(cartItems.id, existing[0].id));
    } else {
      await db.insert(cartItems).values({
        userId,
        productId,
        quantity,
        size: size || null,
        color: color || null,
      });
    }

    const items = await getCartWithProducts(userId);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Cart add error:", error);
    return NextResponse.json({ error: "添加到购物车失败" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { itemId, quantity } = await request.json();

    if (quantity < 1) {
      await db
        .delete(cartItems)
        .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)));
    } else {
      await db
        .update(cartItems)
        .set({ quantity })
        .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)));
    }

    const items = await getCartWithProducts(userId);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Cart update error:", error);
    return NextResponse.json({ error: "更新购物车失败" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { itemId } = await request.json();
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)));

    const items = await getCartWithProducts(userId);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Cart delete error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
