"use client";

import { useState, useEffect } from "react";

interface Stats {
  totalOrders: number;
  revenue: string;
  totalProducts: number;
  totalUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-serif text-[#2d2a24]">数据看板</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="总订单" value={stats?.totalOrders.toString() || "0"} />
        <StatCard label="总收入" value={`¥${parseFloat(stats?.revenue || "0").toFixed(2)}`} />
        <StatCard label="商品总数" value={stats?.totalProducts.toString() || "0"} />
        <StatCard label="用户总数" value={stats?.totalUsers.toString() || "0"} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="text-sm text-[#7a746e]">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-[#2d2a24]">{value}</div>
    </div>
  );
}
