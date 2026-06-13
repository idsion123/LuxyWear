import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  const payload = await verifyToken(token, "customer");
  return payload;
}

export async function GET() {
  try {
    const payload = await getUserFromToken();
    if (!payload) return NextResponse.json({ user: null });

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        phone: users.phone,
        avatar: users.avatar,
      })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await getUserFromToken();
    if (!payload) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, avatar } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "姓名不能为空" }, { status: 400 });
    }

    const updateData: { name: string; phone: string | null; avatar?: string | null } = {
      name: name.trim(),
      phone: phone?.trim() || null,
    };
    if (avatar !== undefined) updateData.avatar = avatar || null;

    await db.update(users).set(updateData).where(eq(users.id, payload.userId));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
