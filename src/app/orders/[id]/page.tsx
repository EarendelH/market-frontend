"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getOrderById,
  getOrderPrimaryAction,
  getOrderStatusMeta,
  getViewerRoleMeta,
  type OrderStatus,
} from "@/lib/mock-orders";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const order = getOrderById(id);
  const [status, setStatus] = useState<OrderStatus>(order?.status ?? "pending");

  const primaryAction = useMemo(() => {
    if (!order) {
      return null;
    }
    return getOrderPrimaryAction(status, order.viewerRole);
  }, [order, status]);

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-muted-foreground">
        <span className="text-6xl">📦</span>
        <p className="text-lg font-medium">订单不存在</p>
        <Link href="/orders">
          <Button variant="outline">返回订单列表</Button>
        </Link>
      </div>
    );
  }

  const statusMeta = getOrderStatusMeta(status);
  const roleMeta = getViewerRoleMeta(order.viewerRole);
  const counterpartName =
    order.viewerRole === "buyer" ? order.sellerName : order.buyerName;

  function handlePrimaryAction() {
    if (!primaryAction) {
      return;
    }

    if (primaryAction.key === "accept") {
      setStatus("confirmed");
      toast.success("订单已接受", {
        description: "订单状态已更新为 confirmed，接下来等待买家确认收货。",
      });
      return;
    }

    setStatus("completed");
    toast.success("已确认收货", {
      description: "订单状态已更新为 completed。",
    });
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-full p-1.5 text-lg leading-none transition-colors hover:bg-muted"
            aria-label="返回"
          >
            ←
          </button>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">订单详情</p>
            <h1 className="truncate text-xl font-bold">{order.itemTitle}</h1>
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br ${order.itemGradient} text-4xl`}
            >
              {order.itemEmoji}
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusMeta.className}`}>
                  {statusMeta.label}
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  {roleMeta.label}
                </span>
              </div>
              <div>
                <p className="text-lg font-semibold">{order.itemTitle}</p>
                <p className="mt-1 text-sm text-muted-foreground">订单号：{order.id}</p>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <p>
                  {roleMeta.counterpartLabel}：<span className="font-medium text-foreground">{counterpartName}</span>
                </p>
                <p>
                  金额：<span className="font-medium text-foreground">¥{order.price}</span>
                </p>
                <p>
                  下单时间：<span className="font-medium text-foreground">{order.createdAt}</span>
                </p>
                <p>
                  当前状态：<span className="font-medium text-foreground">{status}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-3xl border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              交易安排
            </h2>
            <div className="mt-3 space-y-2 text-sm">
              <p>
                交易时间：
                <span className="font-medium text-foreground"> {order.meetingTime}</span>
              </p>
              <p>
                交易地点：
                <span className="font-medium text-foreground"> {order.meetingLocation}</span>
              </p>
            </div>
          </section>

          <section className="rounded-3xl border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              订单说明
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {order.note}
            </p>
          </section>
        </div>

        <section className="rounded-3xl border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Conditional Action Buttons
          </h2>
          <div className="mt-3 space-y-3">
            {primaryAction ? (
              <>
                <p className="text-sm text-muted-foreground">
                  当前根据订单状态 <span className="font-medium text-foreground">{status}</span> 与
                  用户角色 <span className="font-medium text-foreground">{order.viewerRole}</span>，
                  需要显示主操作按钮：
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handlePrimaryAction}>{primaryAction.label}</Button>
                  <Link href="/chat">
                    <Button variant="outline">联系{roleMeta.counterpartLabel}</Button>
                  </Link>
                </div>
                <p className="text-sm text-primary">{primaryAction.description}</p>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  当前状态和角色组合下，无需显示 Accept / Confirm Receipt 主按钮。
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/chat">
                    <Button variant="outline">联系{roleMeta.counterpartLabel}</Button>
                  </Link>
                  <Link href="/orders">
                    <Button variant="ghost">返回订单列表</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
