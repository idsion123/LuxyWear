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
      <h1 className="mb-6 text-2xl font-serif text-[#2d2a24]">用户管理</h1>

      <div className="rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#e8e3de] text-[#7a746e]">
              <th className="px-6 py-4 font-medium">姓名</th>
              <th className="px-6 py-4 font-medium">邮箱</th>
              <th className="px-6 py-4 font-medium">手机</th>
              <th className="px-6 py-4 font-medium">角色</th>
              <th className="px-6 py-4 font-medium">注册时间</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-[#e8e3de] last:border-0"
              >
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4 text-[#7a746e]">{user.email}</td>
                <td className="px-6 py-4 text-[#7a746e]">
                  {user.phone || "-"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      user.role === "ADMIN"
                        ? "bg-[#f5f0eb] text-[#c9a96e]"
                        : "bg-gray-50 text-gray-500"
                    }`}
                  >
                    {user.role === "ADMIN" ? "管理员" : "用户"}
                  </span>
                </td>
                <td className="px-6 py-4 text-[#7a746e]">
                  {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-[#7a746e]"
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
