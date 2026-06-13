"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/store/auth-context";

export default function AccountPage() {
  const { user, loading, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [showPwd, setShowPwd] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-sm text-[#7a746e]">
        加载中...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="mb-6 text-sm text-[#7a746e]">请先登录</p>
        <Link href="/auth/login" className="text-[#c9a96e] hover:text-[#a8884a]">
          去登录
        </Link>
      </div>
    );
  }

  const startEdit = () => {
    setName(user.name);
    setPhone(user.phone || "");
    setAvatar(user.avatar || null);
    setSaveMsg("");
    setEditing(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAvatar(data.url);
    } catch (e) {
      setSaveMsg(e instanceof Error ? e.message : "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null, avatar }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaveMsg("saved");
      setEditing(false);
      refreshUser();
    } catch (e) {
      setSaveMsg(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdMsg("两次密码不一致");
      return;
    }
    setChangingPwd(true);
    setPwdMsg("");
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPwdMsg("saved");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setPwdMsg(e instanceof Error ? e.message : "修改失败");
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-serif text-3xl text-[#2d2a24]">账户信息</h1>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-[#2d2a24]">个人资料</h2>
            {!editing && (
              <button
                onClick={startEdit}
                className="text-xs text-[#c9a96e] hover:text-[#a8884a]"
              >
                编辑
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full bg-[#f5f0eb]">
                  {avatar ? (
                    <img src={avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-lg text-[#c9a96e]">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="rounded-sm border border-[#e8e3de] px-3 py-1.5 text-xs text-[#7a746e] transition-colors hover:border-[#c9a96e] disabled:opacity-50"
                  >
                    {uploading ? "上传中..." : "上传头像"}
                  </button>
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar(null)}
                      className="ml-2 text-xs text-[#c46565]"
                    >
                      清除
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-[#7a746e]">姓名</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-sm border border-[#e8e3de] px-3 py-2 text-sm outline-none focus:border-[#c9a96e]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#7a746e]">邮箱</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full rounded-sm border border-[#e8e3de] bg-[#faf8f5] px-3 py-2 text-sm text-[#7a746e] outline-none"
                />
                <p className="mt-1 text-xs text-[#7a746e]">邮箱不可修改</p>
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#7a746e]">手机号</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="选填"
                  className="w-full rounded-sm border border-[#e8e3de] px-3 py-2 text-sm outline-none focus:border-[#c9a96e]"
                />
              </div>

              {saveMsg && saveMsg !== "saved" && (
                <p className="text-xs text-[#c46565]">{saveMsg}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="rounded-sm bg-[#c9a96e] px-4 py-2 text-xs text-white transition-colors hover:bg-[#a8884a] disabled:opacity-50"
                >
                  {saving ? "保存中..." : "保存"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-sm border border-[#e8e3de] px-4 py-2 text-xs text-[#7a746e] transition-colors hover:border-[#c9a96e]"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-4 pb-3">
                <div className="h-14 w-14 overflow-hidden rounded-full bg-[#f5f0eb]">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-lg text-[#c9a96e]">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="font-serif text-lg text-[#2d2a24]">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a746e]">姓名</span>
                <span>{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a746e]">邮箱</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a746e]">手机</span>
                <span>{user.phone || "未设置"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Password Card */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-[#2d2a24]">修改密码</h2>
            {!showPwd && (
              <button
                onClick={() => { setShowPwd(true); setPwdMsg(""); }}
                className="text-xs text-[#c9a96e] hover:text-[#a8884a]"
              >
                修改
              </button>
            )}
          </div>

          {showPwd && (
            <form onSubmit={changePassword} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-[#7a746e]">当前密码</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-sm border border-[#e8e3de] px-3 py-2 text-sm outline-none focus:border-[#c9a96e]"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#7a746e]">新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="至少6个字符"
                  className="w-full rounded-sm border border-[#e8e3de] px-3 py-2 text-sm outline-none focus:border-[#c9a96e]"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#7a746e]">确认新密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-sm border border-[#e8e3de] px-3 py-2 text-sm outline-none focus:border-[#c9a96e]"
                  minLength={6}
                  required
                />
              </div>

              {pwdMsg && (
                <p className={`text-xs ${pwdMsg === "saved" ? "text-[#7a9a6d]" : "text-[#c46565]"}`}>
                  {pwdMsg === "saved" ? "密码修改成功" : pwdMsg}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={changingPwd}
                  className="rounded-sm bg-[#c9a96e] px-4 py-2 text-xs text-white transition-colors hover:bg-[#a8884a] disabled:opacity-50"
                >
                  {changingPwd ? "修改中..." : "确认修改"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowPwd(false); setPwdMsg(""); }}
                  className="rounded-sm border border-[#e8e3de] px-4 py-2 text-xs text-[#7a746e] transition-colors hover:border-[#c9a96e]"
                >
                  取消
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Orders Link */}
        <Link
          href="/orders"
          className="block rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#2d2a24]">我的订单</span>
            <span className="text-[#7a746e]">&rarr;</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
