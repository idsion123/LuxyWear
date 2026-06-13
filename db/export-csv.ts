import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

const TABLES = [
  { name: "users", table: schema.users },
  { name: "addresses", table: schema.addresses },
  { name: "categories", table: schema.categories },
  { name: "products", table: schema.products },
  { name: "product_categories", table: schema.productCategories },
  { name: "cart_items", table: schema.cartItems },
  { name: "favorites", table: schema.favorites },
  { name: "orders", table: schema.orders },
  { name: "order_items", table: schema.orderItems },
] as const;

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    let s = "";
    if (v instanceof Date) {
      s = v.toISOString().replace("T", " ").replace("Z", "");
    } else {
      s = v == null ? "" : String(v);
    }
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join(
    "\n"
  );
}

async function main() {
  const outDir = resolve(process.cwd(), "csv-exports-v2");
  mkdirSync(outDir, { recursive: true });
  for (const { name, table } of TABLES) {
    const rows = (await db.select().from(table)) as Record<string, unknown>[];
    const csv = toCSV(rows);
    const filePath = resolve(outDir, `${name}.csv`);
    writeFileSync(filePath, csv, "utf-8");
    console.log(`${name}.csv — ${rows.length} rows`);
  }
  console.log("\nDone!");
}

main().catch(console.error);
