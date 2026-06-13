"use client";

import { useState, useEffect, startTransition } from "react";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  userId: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "待付款",
  PAID: "已付款",
  SHIPPED: "已发货",
  DELIVERED: "已签收",
  CANCELLED: "已取消",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "border-yellow-300 bg-yellow-50 text-yellow-700",
  PAID: "border-blue-300 bg-blue-50 text-blue-700",
  SHIPPED: "border-purple-300 bg-purple-50 text-purple-700",
  DELIVERED: "border-green-300 bg-green-50 text-green-700",
  CANCELLED: "border-red-300 bg-red-50 text-red-700",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const doFetch = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startTransition(() => {
      doFetch();
    });
  }, []);

  if (loading)
    return <div className="text-sm text-[#7a746e]">加载中...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif text-[#2d2a24]">订单管理</h1>
        <p className="mt-1 text-sm text-[#7a746e]">共 {orders.length} 笔订单</p>
      </div>

      <div className="overflow-x-auto border border-[#e8e3de] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#e8e3de] bg-[#faf8f5]">
              <th className="px-5 py-3.5 text-xs font-medium tracking-wider text-[#7a746e] uppercase">订单号</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wider text-[#7a746e] uppercase">金额</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wider text-[#7a746e] uppercase">状态</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wider text-[#7a746e] uppercase">时间</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wider text-[#7a746e] uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-[#e8e3de] last:border-0 hover:bg-[#faf8f5]/50"
              >
                <td className="px-5 py-4 font-mono text-xs text-[#2d2a24]">
                  {order.orderNumber}
                </td>
                <td className="px-5 py-4 text-[#c9a96e]">
                  ¥{parseFloat(order.totalAmount).toFixed(2)}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-block border px-3 py-1 text-xs tracking-wider uppercase ${
                      STATUS_STYLES[order.status] || "border-gray-200 bg-gray-50 text-gray-500"
                    }`}
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-[#7a746e]">
                  {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-xs tracking-wider text-[#c9a96e] transition-colors hover:text-[#a8884a] uppercase"
                  >
                    详情
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-sm text-[#7a746e]"
                >
                  暂无订单
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
