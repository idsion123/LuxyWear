import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ id?: string; number?: string }>;
}

export default async function CheckoutResultPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mb-6 text-5xl text-[#7a9a6d]">✓</div>
      <h1 className="mb-4 font-serif text-3xl text-[#2d2a24]">下单成功</h1>
      <p className="mb-2 text-sm text-[#7a746e]">
        您的订单已成功提交，订单编号：
      </p>
      <p className="mb-8 font-mono text-sm text-[#c9a96e]">
        {params.number || params.id}
      </p>
      <p className="mb-8 text-sm text-[#7a746e]">
        我们会尽快处理您的订单，请耐心等待。
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="/orders"
          className="rounded-sm bg-[#c9a96e] px-8 py-2.5 text-sm text-white transition-colors hover:bg-[#a8884a]"
        >
          查看订单
        </Link>
        <Link
          href="/products"
          className="rounded-sm border border-[#e8e3de] px-8 py-2.5 text-sm text-[#7a746e] hover:bg-[#f5f0eb]"
        >
          继续购物
        </Link>
      </div>
    </div>
  );
}
