import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, cartItems, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  const payload = await verifyToken(token, "customer");
  return payload?.userId || null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const list = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(orders.createdAt);

  return NextResponse.json({ orders: list });
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { addressId, note } = await request.json();

    if (!addressId) {
      return NextResponse.json({ error: "请选择收货地址" }, { status: 400 });
    }

    // Get cart items with product details
    const cart = await db
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

    if (cart.length === 0) {
      return NextResponse.json({ error: "购物车为空" }, { status: 400 });
    }

    const totalAmount = cart.reduce(
      (sum, item) => sum + parseFloat(item.price.toString()) * item.quantity,
      0
    );

    const orderNumber = generateOrderNumber();

    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        userId,
        totalAmount: totalAmount.toFixed(2),
        addressId,
        note: note || null,
      })
      .returning({ id: orders.id });

    // Create order items with snapshots
    await db.insert(orderItems).values(
      cart.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        price: item.price.toString(),
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: Array.isArray(item.image) ? item.image[0] || null : null,
      }))
    );

    // Clear cart
    await db.delete(cartItems).where(eq(cartItems.userId, userId));

    return NextResponse.json({ orderId: order.id, orderNumber }, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "下单失败" }, { status: 500 });
  }
}
