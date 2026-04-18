"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Users, Package, ShoppingBag, Activity, AlertCircle } from "lucide-react";

interface AdminStats {
  total_users: number;
  active_items: number;
  total_items: number;
  total_orders: number;
  completed_orders: number;
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => apiClient.get<AdminStats>("/admin/stats"),
  });

  const statCards = stats
    ? [
        { label: "总用户数", value: stats.total_users, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
        { label: "在线商品", value: stats.active_items, icon: Package, color: "text-purple-600", bg: "bg-purple-100" },
        { label: "总订单数", value: stats.total_orders, icon: ShoppingBag, color: "text-green-600", bg: "bg-green-100" },
        { label: "已完成订单", value: stats.completed_orders, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-100" },
      ]
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">管理后台概览</h1>
          <p className="text-muted-foreground">实时平台数据概况</p>
        </div>
        <span className="text-sm bg-muted px-3 py-1 rounded-full text-muted-foreground">
          系统状态: 🟢 正常运行中
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 bg-card rounded-xl border shadow-sm animate-pulse h-24" />
            ))
          : statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="p-6 bg-card rounded-xl border shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <h2 className="text-2xl font-bold mt-1">{stat.value}</h2>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                    <Icon size={20} />
                  </div>
                </div>
              );
            })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-red-500" />
            快捷操作
          </h3>
          <div className="space-y-3">
            <Link href="/admin/users" className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <p className="font-medium text-sm">用户管理</p>
              <p className="text-xs text-muted-foreground">查看和管理所有注册用户</p>
            </Link>
            <Link href="/admin/items" className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <p className="font-medium text-sm">商品管理</p>
              <p className="text-xs text-muted-foreground">审核和管理平台商品</p>
            </Link>
            <Link href="/admin/orders" className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <p className="font-medium text-sm">订单仲裁</p>
              <p className="text-xs text-muted-foreground">处理交易纠纷</p>
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity size={18} />
            系统信息
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-muted-foreground">总商品数</span>
              <span className="font-medium">{stats?.total_items ?? "—"}</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-muted-foreground">活跃商品</span>
              <span className="font-medium">{stats?.active_items ?? "—"}</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-muted-foreground">完成率</span>
              <span className="font-medium">
                {stats && stats.total_orders > 0
                  ? `${((stats.completed_orders / stats.total_orders) * 100).toFixed(1)}%`
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
