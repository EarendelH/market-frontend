"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.username) errs.username = "请输入用户名";
    else if (form.username.length < 2) errs.username = "用户名至少 2 个字符";
    if (!form.email) errs.email = "请输入邮箱";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "邮箱格式不正确";
    if (!form.password) errs.password = "请输入密码";
    else if (form.password.length < 6) errs.password = "密码至少 6 位";
    if (!form.confirmPassword) errs.confirmPassword = "请确认密码";
    else if (form.password !== form.confirmPassword) errs.confirmPassword = "两次密码不一致";
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
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    router.push("/marketplace");
  }

  const fields = [
    {
      key: "username",
      label: "用户名",
      type: "text",
      placeholder: "给自己起个名字",
    },
    {
      key: "email",
      label: "邮箱",
      type: "email",
      placeholder: "your@mail.sustech.edu.cn",
    },
    {
      key: "password",
      label: "密码",
      type: "password",
      placeholder: "至少 6 位",
    },
    {
      key: "confirmPassword",
      label: "确认密码",
      type: "password",
      placeholder: "再输入一次",
    },
  ] as const;

  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: "太短", color: "bg-red-400", width: "w-1/4" };
    if (p.length < 8) return { label: "一般", color: "bg-yellow-400", width: "w-2/4" };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { label: "强", color: "bg-green-500", width: "w-full" };
    return { label: "中等", color: "bg-blue-400", width: "w-3/4" };
  })();

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
            <h2 className="font-bold text-lg">创建账号</h2>
            <p className="text-sm text-muted-foreground">加入南科大校园交易圈</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, type, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor={key}>
                  {label}
                </label>
                <input
                  id={key}
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30 ${
                    errors[key] ? "border-destructive ring-2 ring-destructive/20" : ""
                  }`}
                />
                {/* Password strength indicator */}
                {key === "password" && passwordStrength && (
                  <div className="space-y-1">
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`} />
                    </div>
                    <p className="text-xs text-muted-foreground">密码强度：{passwordStrength.label}</p>
                  </div>
                )}
                {errors[key] && (
                  <p className="text-xs text-destructive">{errors[key]}</p>
                )}
              </div>
            ))}

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
                  注册中...
                </span>
              ) : (
                "注册"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            已有账号？{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              立即登录
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          注册即表示你同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
}
