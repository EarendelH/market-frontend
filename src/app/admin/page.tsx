"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type ReportStatus = "待审核" | "处理中" | "已关闭";
type UserStatus = "正常" | "观察中" | "已禁用";
type ListingStatus = "上架中" | "待下架" | "已下架";
type OrderStatus = "进行中" | "待介入" | "已退款" | "已完成";

interface ReportRow {
  id: string;
  target: string;
  reporter: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
}

interface UserRow {
  id: string;
  username: string;
  role: string;
  status: UserStatus;
  reportCount: number;
  lastLogin: string;
}

interface ListingRow {
  id: string;
  title: string;
  seller: string;
  status: ListingStatus;
  reports: number;
  updatedAt: string;
}

interface OrderRow {
  id: string;
  item: string;
  buyer: string;
  seller: string;
  status: OrderStatus;
  amount: number;
  updatedAt: string;
}

const initialReports: ReportRow[] = [
  {
    id: "R-301",
    target: "机械键盘（青轴）",
    reporter: "周同学",
    reason: "商品描述与实际严重不符",
    status: "待审核",
    createdAt: "2026-04-18 09:20",
  },
  {
    id: "R-302",
    target: "用户 @seller_amy",
    reporter: "王同学",
    reason: "疑似诈骗/诱导转账",
    status: "处理中",
    createdAt: "2026-04-18 08:10",
  },
  {
    id: "R-303",
    target: "订单 ord-2002",
    reporter: "林同学",
    reason: "恶意放鸽子/虚假交易",
    status: "已关闭",
    createdAt: "2026-04-17 19:55",
  },
];

const initialUsers: UserRow[] = [
  {
    id: "U-101",
    username: "seller_amy",
    role: "USER",
    status: "观察中",
    reportCount: 3,
    lastLogin: "2026-04-18 10:32",
  },
  {
    id: "U-102",
    username: "buyer_bob",
    role: "USER",
    status: "正常",
    reportCount: 0,
    lastLogin: "2026-04-18 09:41",
  },
  {
    id: "U-103",
    username: "admin_demo",
    role: "ADMIN",
    status: "正常",
    reportCount: 0,
    lastLogin: "2026-04-18 11:05",
  },
];

const initialListings: ListingRow[] = [
  {
    id: "L-501",
    title: "AirPods Pro 二代",
    seller: "李同学",
    status: "待下架",
    reports: 2,
    updatedAt: "2026-04-18 08:42",
  },
  {
    id: "L-502",
    title: "算法导论（英文第3版）",
    seller: "赵同学",
    status: "上架中",
    reports: 0,
    updatedAt: "2026-04-17 22:30",
  },
  {
    id: "L-503",
    title: "Nike 跑鞋 42 码",
    seller: "陈同学",
    status: "已下架",
    reports: 1,
    updatedAt: "2026-04-17 18:12",
  },
];

const initialOrders: OrderRow[] = [
  {
    id: "O-801",
    item: "iPad mini 6 WiFi 256G",
    buyer: "林同学",
    seller: "周同学",
    status: "待介入",
    amount: 2800,
    updatedAt: "2026-04-18 10:10",
  },
  {
    id: "O-802",
    item: "高等数学教材（第七版）",
    buyer: "王同学",
    seller: "张同学",
    status: "进行中",
    amount: 25,
    updatedAt: "2026-04-18 09:02",
  },
  {
    id: "O-803",
    item: "哑铃一对 5kg×2",
    buyer: "陈同学",
    seller: "钱同学",
    status: "已完成",
    amount: 55,
    updatedAt: "2026-04-16 18:30",
  },
];

function statusClassName(
  status: ReportStatus | UserStatus | ListingStatus | OrderStatus
) {
  if (status === "待审核" || status === "待下架" || status === "待介入") {
    return "bg-amber-100 text-amber-700";
  }
  if (status === "处理中" || status === "观察中" || status === "进行中") {
    return "bg-blue-100 text-blue-700";
  }
  if (status === "已关闭" || status === "已完成" || status === "正常") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (status === "已禁用" || status === "已下架" || status === "已退款") {
    return "bg-rose-100 text-rose-700";
  }
  return "bg-muted text-muted-foreground";
}

export default function AdminDashboardPage() {
  const [reports, setReports] = useState(initialReports);
  const [users, setUsers] = useState(initialUsers);
  const [listings, setListings] = useState(initialListings);
  const [orders, setOrders] = useState(initialOrders);

  const summary = useMemo(
    () => [
      {
        label: "待处理举报",
        value: reports.filter((item) => item.status !== "已关闭").length,
        hint: "需要管理员跟进",
      },
      {
        label: "观察中用户",
        value: users.filter((item) => item.status === "观察中").length,
        hint: "重点关注账号",
      },
      {
        label: "风险商品",
        value: listings.filter((item) => item.status === "待下架").length,
        hint: "待下架商品数",
      },
      {
        label: "纠纷订单",
        value: orders.filter((item) => item.status === "待介入").length,
        hint: "待管理员介入",
      },
    ],
    [listings, orders, reports, users]
  );

  function showToast(title: string, description: string) {
    toast.success(title, { description });
  }

  function handleReportPrimaryAction(reportId: string) {
    setReports((current) =>
      current.map((report) => {
        if (report.id !== reportId) {
          return report;
        }

        const nextStatus: ReportStatus =
          report.status === "待审核"
            ? "处理中"
            : report.status === "处理中"
              ? "已关闭"
              : "已关闭";

        showToast("举报状态已更新", `${report.id} → ${nextStatus}`);
        return { ...report, status: nextStatus };
      })
    );
  }

  function handleUserPrimaryAction(userId: string) {
    setUsers((current) =>
      current.map((user) => {
        if (user.id !== userId) {
          return user;
        }

        const nextStatus: UserStatus = user.status === "已禁用" ? "正常" : "已禁用";
        showToast("用户状态已更新", `${user.username} → ${nextStatus}`);
        return { ...user, status: nextStatus };
      })
    );
  }

  function handleListingPrimaryAction(listingId: string) {
    setListings((current) =>
      current.map((listing) => {
        if (listing.id !== listingId) {
          return listing;
        }

        const nextStatus: ListingStatus =
          listing.status === "已下架" ? "上架中" : "已下架";
        showToast("商品状态已更新", `${listing.title} → ${nextStatus}`);
        return { ...listing, status: nextStatus };
      })
    );
  }

  function handleOrderPrimaryAction(orderId: string) {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) {
          return order;
        }

        const nextStatus: OrderStatus =
          order.status === "待介入" ? "已退款" : order.status;
        showToast("订单状态已更新", `${order.id} → ${nextStatus}`);
        return { ...order, status: nextStatus };
      })
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-primary">Admin Dashboard</p>
            <h1 className="text-2xl font-bold">管理员独立数据看板</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              聚合举报、用户、商品和订单数据，以表格形式展示，并提供 action column 快捷处理入口。
            </p>
          </div>
          <div className="rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground">
            当前为前端演示版，所有操作均在本地 mock 数据上即时生效。
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summary.map((card) => (
            <section key={card.label} className="rounded-3xl border bg-card p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-2 text-3xl font-bold">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
            </section>
          ))}
        </div>

        <Tabs defaultValue="reports" className="space-y-4">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="reports">举报管理</TabsTrigger>
            <TabsTrigger value="users">用户管理</TabsTrigger>
            <TabsTrigger value="listings">商品管理</TabsTrigger>
            <TabsTrigger value="orders">订单监控</TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <section className="rounded-3xl border bg-card p-4 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">举报数据表</h2>
                <p className="text-sm text-muted-foreground">
                  查看举报对象、原因、当前状态，并通过 action column 快速推进处理。
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-muted/60 text-muted-foreground">
                    <tr>
                      <th className="rounded-l-2xl px-4 py-3 font-medium">举报单号</th>
                      <th className="px-4 py-3 font-medium">对象</th>
                      <th className="px-4 py-3 font-medium">举报人</th>
                      <th className="px-4 py-3 font-medium">原因</th>
                      <th className="px-4 py-3 font-medium">状态</th>
                      <th className="px-4 py-3 font-medium">时间</th>
                      <th className="rounded-r-2xl px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b last:border-b-0">
                        <td className="px-4 py-4 font-medium">{report.id}</td>
                        <td className="px-4 py-4">{report.target}</td>
                        <td className="px-4 py-4">{report.reporter}</td>
                        <td className="px-4 py-4">{report.reason}</td>
                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs font-medium",
                              statusClassName(report.status)
                            )}
                          >
                            {report.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">{report.createdAt}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => showToast("打开举报详情", report.id)}
                            >
                              查看
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleReportPrimaryAction(report.id)}
                            >
                              {report.status === "待审核"
                                ? "开始处理"
                                : report.status === "处理中"
                                  ? "关闭"
                                  : "已关闭"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="users">
            <section className="rounded-3xl border bg-card p-4 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">用户数据表</h2>
                <p className="text-sm text-muted-foreground">
                  管理账号状态、识别高风险用户，并通过 action column 做禁用/恢复处理。
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-muted/60 text-muted-foreground">
                    <tr>
                      <th className="rounded-l-2xl px-4 py-3 font-medium">用户 ID</th>
                      <th className="px-4 py-3 font-medium">用户名</th>
                      <th className="px-4 py-3 font-medium">角色</th>
                      <th className="px-4 py-3 font-medium">状态</th>
                      <th className="px-4 py-3 font-medium">被举报次数</th>
                      <th className="px-4 py-3 font-medium">最近登录</th>
                      <th className="rounded-r-2xl px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b last:border-b-0">
                        <td className="px-4 py-4 font-medium">{user.id}</td>
                        <td className="px-4 py-4">{user.username}</td>
                        <td className="px-4 py-4">{user.role}</td>
                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs font-medium",
                              statusClassName(user.status)
                            )}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">{user.reportCount}</td>
                        <td className="px-4 py-4 text-muted-foreground">{user.lastLogin}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => showToast("打开用户详情", user.username)}
                            >
                              查看
                            </Button>
                            <Button
                              size="sm"
                              variant={user.status === "已禁用" ? "secondary" : "destructive"}
                              onClick={() => handleUserPrimaryAction(user.id)}
                            >
                              {user.status === "已禁用" ? "恢复" : "禁用"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="listings">
            <section className="rounded-3xl border bg-card p-4 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">商品数据表</h2>
                <p className="text-sm text-muted-foreground">
                  聚焦被举报商品与风险上架信息，并通过 action column 进行下架或恢复。
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-muted/60 text-muted-foreground">
                    <tr>
                      <th className="rounded-l-2xl px-4 py-3 font-medium">商品 ID</th>
                      <th className="px-4 py-3 font-medium">标题</th>
                      <th className="px-4 py-3 font-medium">卖家</th>
                      <th className="px-4 py-3 font-medium">状态</th>
                      <th className="px-4 py-3 font-medium">举报次数</th>
                      <th className="px-4 py-3 font-medium">更新时间</th>
                      <th className="rounded-r-2xl px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((listing) => (
                      <tr key={listing.id} className="border-b last:border-b-0">
                        <td className="px-4 py-4 font-medium">{listing.id}</td>
                        <td className="px-4 py-4">{listing.title}</td>
                        <td className="px-4 py-4">{listing.seller}</td>
                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs font-medium",
                              statusClassName(listing.status)
                            )}
                          >
                            {listing.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">{listing.reports}</td>
                        <td className="px-4 py-4 text-muted-foreground">{listing.updatedAt}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => showToast("打开商品详情", listing.title)}
                            >
                              查看
                            </Button>
                            <Button
                              size="sm"
                              variant={listing.status === "已下架" ? "secondary" : "destructive"}
                              onClick={() => handleListingPrimaryAction(listing.id)}
                            >
                              {listing.status === "已下架" ? "恢复" : "下架"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="orders">
            <section className="rounded-3xl border bg-card p-4 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">订单数据表</h2>
                <p className="text-sm text-muted-foreground">
                  聚焦待介入订单与纠纷交易，并通过 action column 做介入或退款处理。
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-muted/60 text-muted-foreground">
                    <tr>
                      <th className="rounded-l-2xl px-4 py-3 font-medium">订单号</th>
                      <th className="px-4 py-3 font-medium">商品</th>
                      <th className="px-4 py-3 font-medium">买家</th>
                      <th className="px-4 py-3 font-medium">卖家</th>
                      <th className="px-4 py-3 font-medium">状态</th>
                      <th className="px-4 py-3 font-medium">金额</th>
                      <th className="px-4 py-3 font-medium">更新时间</th>
                      <th className="rounded-r-2xl px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b last:border-b-0">
                        <td className="px-4 py-4 font-medium">{order.id}</td>
                        <td className="px-4 py-4">{order.item}</td>
                        <td className="px-4 py-4">{order.buyer}</td>
                        <td className="px-4 py-4">{order.seller}</td>
                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs font-medium",
                              statusClassName(order.status)
                            )}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">¥{order.amount}</td>
                        <td className="px-4 py-4 text-muted-foreground">{order.updatedAt}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => showToast("打开订单详情", order.id)}
                            >
                              查看
                            </Button>
                            <Button
                              size="sm"
                              disabled={order.status !== "待介入"}
                              onClick={() => handleOrderPrimaryAction(order.id)}
                            >
                              {order.status === "待介入" ? "介入并退款" : "已处理"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
