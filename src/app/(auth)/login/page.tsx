"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.email) errs.email = "请输入邮箱";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "邮箱格式不正确";
    if (!form.password) errs.password = "请输入密码";
    else if (form.password.length < 6) errs.password = "密码至少 6 位";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    // Simulate login
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    router.push("/marketplace");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold shadow-lg mb-4">
            市
          </div>
          <h1 className="text-2xl font-bold">SUSTech Market</h1>
          <p className="text-muted-foreground text-sm mt-1">南科大校园社交交易平台</p>
        </div>

        {/* Form card */}
        <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-5">
          <div className="space-y-1">
            <h2 className="font-bold text-lg">登录账号</h2>
            <p className="text-sm text-muted-foreground">欢迎回来！</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="email">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@mail.sustech.edu.cn"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30 ${
                  errors.email ? "border-destructive ring-2 ring-destructive/20" : ""
                }`}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" htmlFor="password">
                  密码
                </label>
                <button type="button" className="text-xs text-primary hover:underline">
                  忘记密码？
                </button>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30 ${
                  errors.password ? "border-destructive ring-2 ring-destructive/20" : ""
                }`}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  登录中...
                </span>
              ) : (
                "登录"
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground">或</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            还没有账号？{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              立即注册
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          登录即表示你同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
}
