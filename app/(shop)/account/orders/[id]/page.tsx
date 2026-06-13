"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

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
  shippingFee: string;
  note: string | null;
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "待付款",
  PAID: "已付款",
  SHIPPED: "已发货",
  DELIVERED: "已签收",
  CANCELLED: "已取消",
};

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-sm text-[#7a746e]">
        加载中...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="mb-6 text-sm text-[#7a746e]">订单不存在</p>
        <Link href="/orders" className="text-[#c9a96e]">
          返回订单列表
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/orders"
        className="mb-6 inline-block text-sm text-[#7a746e] hover:text-[#c9a96e]"
      >
        &larr; 返回订单列表
      </Link>

      <div className="mb-8">
        <h1 className="font-serif text-3xl text-[#2d2a24]">订单详情</h1>
        <p className="mt-2 font-mono text-sm text-[#c9a96e]">
          {order.orderNumber}
        </p>
      </div>

      {/* Status */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <span
            className={`rounded-full px-3 py-1 text-sm ${
              order.status === "CANCELLED"
                ? "bg-red-50 text-red-600"
                : order.status === "DELIVERED"
                ? "bg-green-50 text-green-600"
                : "bg-[#f5f0eb] text-[#c9a96e]"
            }`}
          >
            {STATUS_LABELS[order.status] || order.status}
          </span>
          <span className="text-sm text-[#7a746e]">
            {new Date(order.createdAt).toLocaleDateString("zh-CN")}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-medium text-[#2d2a24]">商品信息</h3>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-[#f5f0eb]">
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
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <p className="text-sm text-[#2d2a24]">{item.productName}</p>
                  {(item.size || item.color) && (
                    <p className="text-xs text-[#7a746e]">
                      {item.size && `尺码: ${item.size}`}
                      {item.size && item.color && " / "}
                      {item.color && `颜色: ${item.color}`}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#c9a96e]">
                    ¥{(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-xs text-[#7a746e]">x{item.quantity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-medium text-[#2d2a24]">支付信息</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-[#7a746e]">
            <span>商品金额</span>
            <span>¥{order.totalAmount}</span>
          </div>
          <div className="flex justify-between text-[#7a746e]">
            <span>运费</span>
            <span>免运费</span>
          </div>
          <div className="flex justify-between border-t border-[#e8e3de] pt-2 font-medium text-[#2d2a24]">
            <span>合计</span>
            <span className="text-[#c9a96e]">¥{order.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
