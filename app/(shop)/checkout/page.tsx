"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart-context";
import { useAuth } from "@/store/auth-context";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, fetchCart, totalAmount, clearCart } = useCart();
  const { user } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName || !phone || !street || !city || !state || !zipCode) {
      setError("请填写完整的收货地址");
      return;
    }

    setLoading(true);
    try {
      // First save address
      const addrRes = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, street, city, state, zipCode }),
      });

      if (!addrRes.ok) {
        throw new Error("地址保存失败");
      }

      const { id: addressId } = await addrRes.json();

      // Create order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId, note }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error);
      }

      await clearCart();
      router.push(`/checkout/result?id=${orderData.orderId}&number=${orderData.orderNumber}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "下单失败");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="mb-6 text-sm text-[#7a746e]">请先登录</p>
        <Link href="/auth/login" className="text-[#c9a96e] hover:text-[#a8884a]">
          去登录
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-serif text-3xl text-[#2d2a24]">结算</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-sm font-medium text-[#2d2a24]">
                收货地址
              </h2>

              {error && (
                <div className="mb-4 rounded-sm bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs text-[#7a746e]">
                      收件人 *
                    </label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-sm border border-[#e8e3de] px-3 py-2 text-sm outline-none focus:border-[#c9a96e]"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-[#7a746e]">
                      手机号 *
                    </label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-sm border border-[#e8e3de] px-3 py-2 text-sm outline-none focus:border-[#c9a96e]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-[#7a746e]">
                    街道地址 *
                  </label>
                  <input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full rounded-sm border border-[#e8e3de] px-3 py-2 text-sm outline-none focus:border-[#c9a96e]"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-xs text-[#7a746e]">
                      城市 *
                    </label>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-sm border border-[#e8e3de] px-3 py-2 text-sm outline-none focus:border-[#c9a96e]"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-[#7a746e]">
                      省份 *
                    </label>
                    <input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full rounded-sm border border-[#e8e3de] px-3 py-2 text-sm outline-none focus:border-[#c9a96e]"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-[#7a746e]">
                      邮编 *
                    </label>
                    <input
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full rounded-sm border border-[#e8e3de] px-3 py-2 text-sm outline-none focus:border-[#c9a96e]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-[#7a746e]">
                    备注
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="w-full rounded-sm border border-[#e8e3de] px-3 py-2 text-sm outline-none focus:border-[#c9a96e]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-medium text-[#2d2a24]">
                订单摘要
              </h3>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-[#7a746e]">
                      {item.productName} x{item.quantity}
                    </span>
                    <span>
                      ¥{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-[#e8e3de] pt-4 text-sm">
                <div className="flex justify-between text-[#7a746e]">
                  <span>运费</span>
                  <span>免运费</span>
                </div>
                <div className="mt-2 flex justify-between font-medium text-[#2d2a24]">
                  <span>合计</span>
                  <span className="text-lg text-[#c9a96e]">
                    ¥{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="mt-6 w-full rounded-sm bg-[#c9a96e] py-2.5 text-sm text-white transition-colors hover:bg-[#a8884a] disabled:opacity-50"
              >
                {loading ? "提交中..." : "提交订单"}
              </button>

              <p className="mt-3 text-center text-xs text-[#7a746e]">
                模拟支付，实际不会扣款
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
