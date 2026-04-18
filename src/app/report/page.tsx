"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const REPORT_TARGETS = ["商品信息", "卖家账号", "聊天内容", "订单纠纷", "其他"];
const REPORT_REASONS = [
  "疑似诈骗/诱导转账",
  "商品描述与实际严重不符",
  "违规商品或服务",
  "骚扰辱骂/不文明交流",
  "恶意放鸽子/虚假交易",
  "其他",
];

export default function ReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const itemId = searchParams.get("itemId") ?? "";
  const itemTitle = searchParams.get("itemTitle") ?? "";
  const sellerName = searchParams.get("sellerName") ?? "";

  const [targetType, setTargetType] = useState("商品信息");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const contextSummary = useMemo(() => {
    const values = [
      itemTitle ? `商品：${itemTitle}` : "",
      itemId ? `ID：${itemId}` : "",
      sellerName ? `卖家：${sellerName}` : "",
    ].filter(Boolean);

    return values.join(" · ");
  }, [itemId, itemTitle, sellerName]);

  const canSubmit = Boolean(reason && description.trim().length >= 10);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setSubmitted(true);
    toast.success("举报已提交", {
      description: "平台将尽快审核并处理该举报。",
    });
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-full p-1.5 text-lg leading-none transition-colors hover:bg-muted"
            aria-label="返回"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold">举报</h1>
            <p className="text-sm text-muted-foreground">
              普通用户可在这里提交商品、卖家、聊天或订单相关举报。
            </p>
          </div>
        </div>

        {contextSummary && (
          <section className="rounded-3xl border border-amber-200 bg-amber-50/80 p-4">
            <p className="text-sm font-semibold text-amber-900">举报上下文</p>
            <p className="mt-1 text-sm text-amber-800">{contextSummary}</p>
          </section>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="rounded-3xl border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              1. 选择举报对象
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {REPORT_TARGETS.map((target) => (
                <button
                  key={target}
                  type="button"
                  onClick={() => setTargetType(target)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    targetType === target
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-muted"
                  )}
                >
                  {target}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              2. 选择举报原因
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {REPORT_REASONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setReason(item)}
                  className={cn(
                    "rounded-2xl border p-4 text-left text-sm transition-all",
                    reason === item
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:bg-muted/70"
                  )}
                >
                  <p className="font-medium">{item}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item === "其他" ? "可在下方补充详细说明。" : "请选择最符合当前情况的原因。"}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              3. 补充说明
            </h2>
            <div className="mt-3 space-y-3">
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="请尽量描述发生了什么、时间、地点、聊天内容或交易异常情况（至少 10 个字）"
                className="min-h-32 w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>当前举报对象：{targetType}</span>
                <span>{description.trim().length} / 10+</span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              4. 联系方式（可选）
            </h2>
            <div className="mt-3 space-y-3">
              <input
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder="邮箱 / 手机号 / 微信号（便于平台联系你补充信息）"
                className="h-11 w-full rounded-2xl border border-input bg-transparent px-4 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  checked={anonymous}
                  type="checkbox"
                  onChange={(event) => setAnonymous(event.target.checked)}
                />
                匿名提交（平台仍可审核，但不会向被举报方展示你的身份）
              </label>
            </div>
          </section>

          {submitted && (
            <section className="rounded-3xl border border-emerald-200 bg-emerald-50/90 p-5 text-sm">
              <p className="font-semibold text-emerald-900">举报提交成功</p>
              <div className="mt-2 space-y-1 text-emerald-800">
                <p>举报对象：{targetType}</p>
                <p>举报原因：{reason}</p>
                <p>提交方式：{anonymous ? "匿名" : "实名/可联系"}</p>
              </div>
            </section>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              取消
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              提交举报
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
