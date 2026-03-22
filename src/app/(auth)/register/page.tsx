"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthUser } from "@/stores/auth-store";
import { toast } from "sonner";

const passwordSchema = z
  .string()
  .min(8, "密码至少 8 位")
  .refine((s) => /[a-zA-Z\u4e00-\u9fa5]/.test(s), { message: "密码需包含至少一个字母" })
  .refine((s) => /\d/.test(s), { message: "密码需包含至少一个数字" });

const step1Schema = z
  .object({
    sustech_email: z
      .string()
      .email("请输入有效邮箱")
      .refine((s) => s.endsWith("@mail.sustech.edu.cn"), { message: "请使用南科大邮箱 @mail.sustech.edu.cn" }),
    username: z.string().min(2, "用户名至少 2 个字符").max(32, "用户名过长"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

type Step1Values = z.infer<typeof step1Schema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      sustech_email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [code, setCode] = useState("");

  async function onSendCode(values: Step1Values) {
    setLoading(true);
    try {
      await apiClient.post("/auth/register", {
        sustech_email: values.sustech_email,
        username: values.username,
        password: values.password,
      });
      toast.success("验证码已发送至邮箱（开发环境可查看后端控制台）");
      setPendingEmail(values.sustech_email);
      setStep(2);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "请求失败";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return toast.error("请输入验证码");

    setLoading(true);
    try {
      const res = await apiClient.post<{ token: string; user: AuthUser }>("/auth/register/verify", {
        sustech_email: pendingEmail || getValues("sustech_email"),
        code: code.trim(),
      });
      setAuth(res.user, res.token);
      toast.success("注册成功！");
      router.push("/marketplace");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "验证失败";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold shadow-lg mb-4">
            市
          </div>
          <h1 className="text-2xl font-bold">SUSTech Market</h1>
        </div>

        <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-5">
          <h2 className="font-bold text-lg">{step === 1 ? "创建账号" : "输入验证码"}</h2>

          {step === 1 ? (
            <form onSubmit={handleSubmit(onSendCode)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">用户名</label>
                <input
                  {...register("username")}
                  className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none"
                  placeholder="小明"
                />
                {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">南科大邮箱</label>
                <input
                  type="email"
                  {...register("sustech_email")}
                  className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none"
                  placeholder="your@mail.sustech.edu.cn"
                />
                {errors.sustech_email && <p className="text-xs text-destructive">{errors.sustech_email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">密码</label>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none"
                  placeholder="至少 8 位，含字母与数字"
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">确认密码</label>
                <input
                  type="password"
                  {...register("confirmPassword")}
                  className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none"
                  placeholder="再次输入密码"
                />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary py-3 text-sm text-primary-foreground hover:opacity-90"
              >
                {loading ? "发送中..." : "获取验证码"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-xs text-muted-foreground">已向 {pendingEmail || getValues("sustech_email")} 发送 6 位验证码（10 分钟内有效）</p>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6 位数字"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none text-center tracking-widest font-mono text-lg"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary py-3 text-sm text-primary-foreground hover:opacity-90"
              >
                {loading ? "验证中..." : "完成注册"}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-xs text-muted-foreground hover:underline">
                返回上一步
              </button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground">
            已有账号？{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
