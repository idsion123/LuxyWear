import { NextResponse } from "next/server";
import { validateFile, generateFilename, sanitizeDir, uploadToBlob, saveToDisk } from "@/lib/upload";

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

    const dir = formData.get("dir") as string | null;
    const subDir = sanitizeDir(dir);
    const filename = generateFilename(file.name);
    const isLocal = !process.env.BLOB_READ_WRITE_TOKEN;

    const url = isLocal
      ? await saveToDisk(file, `products/${subDir}`, filename)
      : await uploadToBlob(file, `images/products/${subDir}/${filename}`);

    return NextResponse.json({ url, filename, dir: subDir });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: `上传失败: ${message}` }, { status: 500 });
  }
}
