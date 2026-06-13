import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#e8e3de] bg-[#f5f0eb]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="mb-4 font-serif text-lg text-[#c9a96e]">LUXE</h3>
            <p className="text-sm leading-relaxed text-[#7a746e]">
              精致女装，轻奢生活。
              <br />
              为每一位追求品质的您。
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-4 text-sm font-medium text-[#2d2a24]">快速链接</h4>
            <ul className="space-y-2 text-sm text-[#7a746e]">
              <li><Link href="/products" className="hover:text-[#c9a96e]">全部商品</Link></li>
              <li><Link href="/products?category=new" className="hover:text-[#c9a96e]">新品上市</Link></li>
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h4 className="mb-4 text-sm font-medium text-[#2d2a24]">客户服务</h4>
            <ul className="space-y-2 text-sm text-[#7a746e]">
              <li><span className="cursor-default">客服电话：400-888-8888</span></li>
              <li><span className="cursor-default">服务时间：9:00 - 21:00</span></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="mb-4 text-sm font-medium text-[#2d2a24]">关注我们</h4>
            <div className="flex gap-4 text-sm text-[#7a746e]">
              <span className="cursor-default">微信</span>
              <span className="cursor-default">微博</span>
              <span className="cursor-default">小红书</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[#e8e3de] pt-8 text-center text-xs text-[#7a746e]">
          &copy; 2026 LUXE. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
