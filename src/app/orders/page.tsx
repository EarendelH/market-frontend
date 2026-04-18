"use client";

import Link from "next/link";
import {
  getOrderPrimaryAction,
  getOrderStatusMeta,
  getViewerRoleMeta,
  mockOrders,
} from "@/lib/mock-orders";

export default function OrdersPage() {
  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">订单</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            这里展示买家与卖家的订单详情入口，可用于验证不同角色和状态下的按钮渲染。
          </p>
        </div>

        <div className="grid gap-4">
          {mockOrders.map((order) => {
            const status = getOrderStatusMeta(order.status);
            const role = getViewerRoleMeta(order.viewerRole);
            const action = getOrderPrimaryAction(order.status, order.viewerRole);
            const counterpart =
              order.viewerRole === "buyer" ? order.sellerName : order.buyerName;

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-3xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${order.itemGradient} text-3xl`}
                  >
                    {order.itemEmoji}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold">{order.itemTitle}</h2>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                        {role.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>订单号：{order.id}</span>
                      <span>
                        {role.counterpartLabel}：{counterpart}
                      </span>
                      <span>金额：¥{order.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.note}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="text-xs text-muted-foreground">
                        交易时间：{order.meetingTime}
                      </span>
                      <span className="text-xs font-medium text-primary">
                        {action ? `当前主操作：${action.label}` : "当前无可执行主操作"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
