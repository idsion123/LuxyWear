import { db } from "@/lib/db";
import { products, categories } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const maxDuration = 30;

async function buildSystemPrompt(): Promise<string> {
  const catList = await db
    .select({ name: categories.name, slug: categories.slug })
    .from(categories)
    .orderBy(desc(categories.parentId));

  const featured = await db
    .select({ name: products.name, slug: products.slug, price: products.price })
    .from(products)
    .where(eq(products.isFeatured, true))
    .limit(20);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.isPublished, true));

  const categoryInfo = catList.map((c) => `${c.name}(${c.slug})`).join("、");
  const samples = featured.map((p) => `${p.name} ¥${p.price} → /products/${p.slug}`).join("\n");

  return `你是一个 LUXE 轻奢女装电商的购物助手，用中文回答顾客问题。

## 店铺信息
- 品牌：LUXE 轻奢女装
- 风格：轻奢、优雅、精致
- 价格区间：49 - 1999 元
- 商品总数：${count}+ 件

## 商品分类
${categoryInfo}

## 精选商品（部分）
${samples || "暂无"}

## 回复规则
- 简洁专业，每段不超过 3 句话
- 推荐商品时给出具体名称和价格
- 推荐商品附上链接：/products/[slug]
- 不确定的信息不要编造
- 始终友好、耐心、有礼貌`;
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const systemPrompt = await buildSystemPrompt();

  const response = await fetch(
    "https://api.deepseek.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    }
  );

  if (!response.ok) {
    return new Response(JSON.stringify({ error: "AI 服务暂时不可用" }), {
      status: 502,
    });
  }

  const reader = response.body?.getReader();
  if (!reader) {
    return new Response(JSON.stringify({ error: "无法读取响应" }), {
      status: 500,
    });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const processChunk = (chunk: string) => {
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const text = json.choices?.[0]?.delta?.content || "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          } catch {
            // skip malformed lines
          }
        }
      };

      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          processChunk(buffer);
          buffer = "";
        }
      } catch {
        // stream interrupted
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
