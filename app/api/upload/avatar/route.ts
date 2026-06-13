import { NextResponse } from "next/server";
import { validateFile, generateFilename, uploadToBlob, saveToDisk } from "@/lib/upload";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "请选择文件" }, { status: 400 });
    }

    const validationError = validateFile(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Avatar specific: 2MB limit for avatar
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "文件大小不能超过 2MB" }, { status: 400 });
    }

    const filename = `avatar-${generateFilename(file.name)}`;
    const isLocal = !process.env.BLOB_READ_WRITE_TOKEN;

    const url = isLocal
      ? await saveToDisk(file, "avatars", filename)
      : await uploadToBlob(file, `images/avatars/${filename}`);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
