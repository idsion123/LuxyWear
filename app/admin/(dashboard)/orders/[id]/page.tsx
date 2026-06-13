"use client";

import { useState, useEffect } from "react";
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

  const fetchOrder = async () => {
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
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const updateStatus = async (status: string) => {
    try {
      const res = await fetch(`/api/orders/${params.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchOrder();
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
        className="mb-6 inline-block text-sm text-[#7a746e] hover:text-[#c9a96e]"
      >
        &larr; 返回订单列表
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-[#2d2a24]">订单详情</h1>
          <p className="mt-1 font-mono text-sm text-[#c9a96e]">
            {order.orderNumber}
          </p>
        </div>
        <div className="flex gap-2">
          {allowedTransitions.map((status) => (
            <button
              key={status}
              onClick={() => updateStatus(status)}
              className="rounded-sm bg-[#c9a96e] px-4 py-2 text-xs text-white hover:bg-[#a8884a]"
            >
              标记为{STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-medium text-[#2d2a24]">商品信息</h3>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[#7a746e]">
              <th className="pb-3 font-medium">商品</th>
              <th className="pb-3 font-medium">价格</th>
              <th className="pb-3 font-medium">数量</th>
              <th className="pb-3 font-medium">小计</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-[#e8e3de]">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-sm bg-[#f5f0eb]">
                      {item.image && (
                        <img
                          src={item.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm">{item.productName}</p>
                      {(item.size || item.color) && (
                        <p className="text-xs text-[#7a746e]">
                          {item.size} {item.color}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3">¥{item.price}</td>
                <td className="py-3">{item.quantity}</td>
                <td className="py-3">
                  ¥{(parseFloat(item.price) * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-[#7a746e]">
            <span>订单编号</span>
            <span className="font-mono">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between text-[#7a746e]">
            <span>创建时间</span>
            <span>{new Date(order.createdAt).toLocaleString("zh-CN")}</span>
          </div>
          <div className="flex justify-between text-[#7a746e]">
            <span>订单金额</span>
            <span className="text-[#c9a96e]">
              ¥{parseFloat(order.totalAmount).toFixed(2)}
            </span>
          </div>
          {order.note && (
            <div className="flex justify-between text-[#7a746e]">
              <span>备注</span>
              <span>{order.note}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
