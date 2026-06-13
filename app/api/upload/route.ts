import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "请选择文件" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "仅支持 JPG、PNG、WebP 格式" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "文件大小不能超过 5MB" },
        { status: 400 }
      );
    }

    const dir = formData.get("dir") as string | null;
    const subDir = dir && /^[a-z0-9_-]+$/.test(dir) ? dir : "others";
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const blob = await put(`images/products/${subDir}/${filename}`, file, {
      access: "public",
    });

    return NextResponse.json({
      url: blob.url,
      filename,
      dir: subDir,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
