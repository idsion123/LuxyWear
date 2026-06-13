import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, products, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const [orderStats] = await db
      .select({
        total: sql<number>`count(*)`,
        revenue: sql<string>`coalesce(sum(total_amount), 0)`,
      })
      .from(orders);

    const [productCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products);

    const [userCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "CUSTOMER"));

    return NextResponse.json({
      totalOrders: Number(orderStats.total),
      revenue: orderStats.revenue,
      totalProducts: Number(productCount.count),
      totalUsers: Number(userCount.count),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "获取统计失败" }, { status: 500 });
  }
}
