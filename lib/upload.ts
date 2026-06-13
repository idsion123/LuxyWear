import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { put } from "@vercel/blob";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

// Dynamic import so sharp is optional — native binary may fail on Vercel
let sharpFactory: typeof import("sharp") | null | undefined = undefined;

async function getSharp() {
  if (sharpFactory !== undefined) return sharpFactory;
  try {
    sharpFactory = await import("sharp");
  } catch {
    sharpFactory = null;
  }
  return sharpFactory;
}

async function compressImage(buffer: Buffer): Promise<Buffer> {
  const mod = await getSharp();
  if (!mod) return buffer;
  const sharp = mod.default;
  return sharp(buffer)
    .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

export function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "仅支持 JPG、PNG、WebP 格式";
  }
  if (file.size > MAX_SIZE) {
    return "文件大小不能超过 5MB";
  }
  return null;
}

export async function generateFilename(): Promise<string> {
  const sharp = await getSharp();
  const ext = sharp ? "webp" : "jpg";
  return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
}

export function sanitizeDir(dir: string | null): string {
  return dir && /^[a-z0-9_-]+$/.test(dir) ? dir : "others";
}

// Vercel Blob upload (production)
export async function uploadToBlob(
  file: File,
  path: string
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const processed = await compressImage(buffer);
  const blob = await put(path, processed, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return blob.url;
}

// Local filesystem upload (development)
export async function saveToDisk(
  file: File,
  subDir: string,
  filename: string
): Promise<string> {
  const dir = join(process.cwd(), "public", "images", subDir);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const processed = await compressImage(buffer);
  await writeFile(join(dir, filename), processed);
  return `/images/${subDir}/${filename}`;
}
