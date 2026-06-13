"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart-context";
import { useAuth } from "@/store/auth-context";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, loading, fetchCart, updateQuantity, removeItem, totalAmount } =
    useCart();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="mb-4 font-serif text-2xl text-[#2d2a24]">购物车</h1>
        <p className="mb-6 text-sm text-[#7a746e]">请先登录以查看购物车</p>
        <Link
          href="/auth/login"
          className="inline-block rounded-sm bg-[#c9a96e] px-8 py-2.5 text-sm text-white"
        >
          登录
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-serif text-3xl text-[#2d2a24]">购物车</h1>

      {loading ? (
        <div className="py-12 text-center text-sm text-[#7a746e]">加载中...</div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center">
          <p className="mb-6 text-sm text-[#7a746e]">购物车是空的</p>
          <Link
            href="/products"
            className="inline-block rounded-sm bg-[#c9a96e] px-8 py-2.5 text-sm text-white"
          >
            去逛逛
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-lg bg-white p-4 shadow-sm"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-[#f5f0eb]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[#e8e3de]">
                        LUXE
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="text-sm text-[#2d2a24]">
                        {item.productName}
                      </h3>
                      {(item.size || item.color) && (
                        <p className="mt-0.5 text-xs text-[#7a746e]">
                          {item.size && `尺码: ${item.size}`}
                          {item.size && item.color && " / "}
                          {item.color && `颜色: ${item.color}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-sm border border-[#e8e3de] text-xs text-[#7a746e]"
                        >
                          -
                        </button>
                        <span className="text-sm">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.min(item.stock || 99, item.quantity + 1)
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-sm border border-[#e8e3de] text-xs text-[#7a746e]"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-[#c9a96e]">
                          ¥{(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-[#c46565]"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-medium text-[#2d2a24]">
                订单摘要
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#7a746e]">
                  <span>商品小计</span>
                  <span>¥{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#7a746e]">
                  <span>运费</span>
                  <span>免运费</span>
                </div>
                <div className="border-t border-[#e8e3de] pt-3">
                  <div className="flex justify-between font-medium text-[#2d2a24]">
                    <span>合计</span>
                    <span className="text-[#c9a96e]">
                      ¥{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => router.push("/checkout")}
                className="mt-6 w-full rounded-sm bg-[#c9a96e] py-2.5 text-sm text-white transition-colors hover:bg-[#a8884a]"
              >
                去结算
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
