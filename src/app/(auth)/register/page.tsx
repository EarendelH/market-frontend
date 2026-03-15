"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ sustech_email: "", username: "", password: "", code: "" });

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!form.sustech_email || !form.username || !form.password) {
      toast.error("请填写完整信息");
      return;
    }
    setLoading(true);
    try {
      await apiClient.post("/auth/register", {
        sustech_email: form.sustech_email,
        username: form.username,
        password: form.password,
      });
      toast.success("验证码已发送至邮箱（若未配置 SMTP 请查看后端控制台）");
      setStep(2);
    } catch (error: any) {
      toast.error(error.message || "请求失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code) return toast.error("请输入验证码");
    
    setLoading(true);
    try {
      const res = await apiClient.post<{ token: string; user: any }>("/auth/register/verify", {
        sustech_email: form.sustech_email,
        code: form.code,
      });
      setAuth(res.user, res.token);
      toast.success("注册成功！");
      router.push("/marketplace");
    } catch (error: any) {
      toast.error(error.message || "验证失败");
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
          <h2 className="font-bold text-lg">{step === 1 ? "创建账号" : "输入验证码"}</h2>
          
          {step === 1 ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <input
                type="text" placeholder="用户名" value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none"
              />
              <input
                type="email" placeholder="南科大邮箱" value={form.sustech_email}
                onChange={(e) => setForm({ ...form, sustech_email: e.target.value })}
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none"
              />
              <input
                type="password" placeholder="密码 (至少8位, 包含字母和数字)" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none"
              />
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary py-3 text-sm text-primary-foreground hover:opacity-90">
                {loading ? "发送中..." : "获取验证码"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-xs text-muted-foreground">已向 {form.sustech_email} 发送验证码</p>
              <input
                type="text" placeholder="6位验证码" value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none text-center tracking-widest font-mono text-lg"
              />
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary py-3 text-sm text-primary-foreground hover:opacity-90">
                {loading ? "验证中..." : "完成注册"}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-xs text-muted-foreground hover:underline">返回上一步</button>
            </form>
          )}
          
          <p className="text-center text-sm text-muted-foreground">
            已有账号？ <Link href="/login" className="font-semibold text-primary hover:underline">立即登录</Link>
          </p>
        </div>
      </div>
    </div>
  );
}