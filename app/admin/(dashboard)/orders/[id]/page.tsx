"use client";

import { useState, useEffect, startTransition } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ORDER_STATUS_TRANSITIONS } from "@/lib/constants";

interface OrderItem {
  id: string;
  productName: string;
  price: string;
  quantity: number;
  size: string | null;
  color: string | null;
  image: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  note: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "待付款",
  PAID: "已付款",
  SHIPPED: "已发货",
  DELIVERED: "已签收",
  CANCELLED: "已取消",
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/orders/${params.id}`);
        const data = await res.json();
        setOrder(data.order);
        setItems(data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });
  }, [params.id]);

  const updateStatus = async (status: string) => {
    try {
      const res = await fetch(`/api/orders/${params.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const r = await fetch(`/api/orders/${params.id}`);
        const data = await r.json();
        setOrder(data.order);
        setItems(data.items || []);
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return <div className="text-sm text-[#7a746e]">加载中...</div>;
  if (!order)
    return <div className="text-sm text-[#7a746e]">订单不存在</div>;

  const allowedTransitions = ORDER_STATUS_TRANSITIONS[order.status] || [];

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-6 inline-flex items-center gap-1 text-xs tracking-wider text-[#7a746e] transition-colors hover:text-[#c9a96e] uppercase"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        返回订单列表
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#2d2a24]">订单详情</h1>
          <p className="mt-1 font-mono text-xs tracking-wider text-[#c9a96e]">
            {order.orderNumber}
          </p>
        </div>
        {allowedTransitions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allowedTransitions.map((status) => (
              <button
                key={status}
                onClick={() => updateStatus(status)}
                className="border border-[#c9a96e] bg-[#c9a96e] px-4 py-2 text-xs tracking-wider text-white transition-colors hover:bg-[#a8884a] hover:border-[#a8884a] uppercase"
              >
                标记为{STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="mb-6 border border-[#e8e3de] bg-white">
        <div className="border-b border-[#e8e3de] px-5 py-4">
          <h3 className="text-xs font-medium tracking-wider text-[#2d2a24] uppercase">商品信息</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#faf8f5] text-xs tracking-wider text-[#7a746e] uppercase">
              <th className="px-5 py-3 font-medium">商品</th>
              <th className="px-5 py-3 font-medium">价格</th>
              <th className="px-5 py-3 font-medium">数量</th>
              <th className="px-5 py-3 font-medium">小计</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-[#e8e3de] hover:bg-[#faf8f5]/50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden border border-[#e8e3de] bg-[#f5f0eb]">
                      {item.image && (
                        <img
                          src={item.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-[#2d2a24]">{item.productName}</p>
                      {(item.size || item.color) && (
                        <p className="mt-0.5 text-xs text-[#7a746e]">
                          {item.size} {item.color}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-[#7a746e]">¥{item.price}</td>
                <td className="px-5 py-4 text-[#7a746e]">{item.quantity}</td>
                <td className="px-5 py-4 text-[#c9a96e]">
                  ¥{(parseFloat(item.price) * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Info */}
      <div className="border border-[#e8e3de] bg-white">
        <div className="border-b border-[#e8e3de] px-5 py-4">
          <h3 className="text-xs font-medium tracking-wider text-[#2d2a24] uppercase">订单信息</h3>
        </div>
        <div className="divide-y divide-[#e8e3de] px-5 py-2 text-sm">
          <div className="flex justify-between py-3">
            <span className="text-[#7a746e]">订单编号</span>
            <span className="font-mono text-[#2d2a24]">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-[#7a746e]">创建时间</span>
            <span className="text-[#2d2a24]">{new Date(order.createdAt).toLocaleString("zh-CN")}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-[#7a746e]">订单金额</span>
            <span className="text-[#c9a96e] font-medium">
              ¥{parseFloat(order.totalAmount).toFixed(2)}
            </span>
          </div>
          {order.note && (
            <div className="flex justify-between py-3">
              <span className="text-[#7a746e]">备注</span>
              <span className="text-[#2d2a24]">{order.note}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
