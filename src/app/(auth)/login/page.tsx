"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner"; // 引入 sonner 提示组件

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ sustech_email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.sustech_email || !form.password) {
      toast.error("请填写邮箱和密码");
      return;
    }
    
    setLoading(true);
    try {
      const res = await apiClient.post<{ token: string; user: any }>("/auth/login", form);
      setAuth(res.user, res.token);
      toast.success("登录成功");
      router.push("/marketplace");
    } catch (error: any) {
      toast.error(error.message || "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold shadow-lg mb-4">市</div>
          <h1 className="text-2xl font-bold">SUSTech Market</h1>
        </div>
        <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-5">
          <div className="space-y-1">
            <h2 className="font-bold text-lg">登录账号</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">南科大邮箱</label>
              <input
                type="email"
                placeholder="your@mail.sustech.edu.cn"
                value={form.sustech_email}
                onChange={(e) => setForm({ ...form, sustech_email: e.target.value })}
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">密码</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {loading ? "登录中..." : "登录"}
            </button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            还没有账号？ <Link href="/register" className="font-semibold text-primary hover:underline">立即注册</Link>
          </p>
        </div>
      </div>
    </div>
  );
}