import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { addresses } from "@/db/schema";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  const payload = await verifyToken(token, "customer");
  return payload?.userId || null;
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { fullName, phone, street, city, state, zipCode, label } =
      await request.json();

    const [addr] = await db
      .insert(addresses)
      .values({
        userId,
        fullName,
        phone,
        street,
        city,
        state,
        zipCode,
        label: label || null,
      })
      .returning({ id: addresses.id });

    return NextResponse.json({ id: addr.id }, { status: 201 });
  } catch (error) {
    console.error("Address create error:", error);
    return NextResponse.json({ error: "地址保存失败" }, { status: 500 });
  }
}
