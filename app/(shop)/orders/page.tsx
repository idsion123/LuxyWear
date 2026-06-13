"use client";

import { useState, useEffect, startTransition } from "react";
import Link from "next/link";
import { useAuth } from "@/store/auth-context";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "待付款",
  PAID: "已付款",
  SHIPPED: "已发货",
  DELIVERED: "已签收",
  CANCELLED: "已取消",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startTransition(() => {
      if (user) {
        fetch("/api/orders")
          .then((r) => r.json())
          .then((data) => setOrders(data.orders || []))
          .catch(console.error)
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="mb-4 font-serif text-2xl text-[#2d2a24]">我的订单</h1>
        <p className="mb-6 text-sm text-[#7a746e]">请先登录</p>
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-serif text-3xl text-[#2d2a24]">我的订单</h1>

      {loading ? (
        <div className="py-12 text-center text-sm text-[#7a746e]">加载中...</div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center">
          <p className="mb-6 text-sm text-[#7a746e]">暂无订单</p>
          <Link
            href="/products"
            className="inline-block rounded-sm bg-[#c9a96e] px-8 py-2.5 text-sm text-white"
          >
            去购物
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm text-[#c9a96e]">
                    {order.orderNumber}
                  </p>
                  <p className="mt-1 text-xs text-[#7a746e]">
                    {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#c9a96e]">
                    ¥{order.totalAmount}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${
                      order.status === "CANCELLED"
                        ? "bg-red-50 text-red-600"
                        : order.status === "DELIVERED"
                        ? "bg-green-50 text-green-600"
                        : "bg-[#f5f0eb] text-[#c9a96e]"
                    }`}
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
