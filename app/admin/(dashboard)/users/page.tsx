"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="text-sm text-[#7a746e]">加载中...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif text-[#2d2a24]">用户管理</h1>
        <p className="mt-1 text-sm text-[#7a746e]">共 {users.length} 个用户</p>
      </div>

      <div className="overflow-x-auto border border-[#e8e3de] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#e8e3de] bg-[#faf8f5]">
              <th className="px-5 py-3.5 text-xs font-medium tracking-wider text-[#7a746e] uppercase">姓名</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wider text-[#7a746e] uppercase">邮箱</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wider text-[#7a746e] uppercase">手机</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wider text-[#7a746e] uppercase">角色</th>
              <th className="px-5 py-3.5 text-xs font-medium tracking-wider text-[#7a746e] uppercase">注册时间</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-[#e8e3de] last:border-0 hover:bg-[#faf8f5]/50"
              >
                <td className="px-5 py-4 font-medium text-[#2d2a24]">{user.name}</td>
                <td className="px-5 py-4 text-[#7a746e]">{user.email}</td>
                <td className="px-5 py-4 text-[#7a746e]">
                  {user.phone || "—"}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-block border px-3 py-1 text-xs tracking-wider uppercase ${
                      user.role === "ADMIN"
                        ? "border-[#c9a96e]/30 bg-[#f5f0eb] text-[#c9a96e]"
                        : "border-gray-200 bg-gray-50 text-gray-500"
                    }`}
                  >
                    {user.role === "ADMIN" ? "管理员" : "用户"}
                  </span>
                </td>
                <td className="px-5 py-4 text-[#7a746e]">
                  {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-sm text-[#7a746e]"
                >
                  暂无用户
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
