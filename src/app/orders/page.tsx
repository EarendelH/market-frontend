"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { Package, Clock, CheckCircle2 } from "lucide-react";

interface Order {
  id: number;
  item_id: number;
  buyer_id: number;
  seller_id: number;
  price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  note: string | null;
  created_at: string;
  completed_by_buyer?: boolean;
  completed_by_seller?: boolean;
  item_title?: string;
  item_cover?: string | null;
}

const statusMap = {
  pending: { label: "待确认", color: "text-amber-600 bg-amber-50 border-amber-200" },
  confirmed: { label: "进行中", color: "text-blue-600 bg-blue-50 border-blue-200" },
  completed: { label: "已完成", color: "text-green-600 bg-green-50 border-green-200" },
  cancelled: { label: "已取消", color: "text-slate-600 bg-slate-50 border-slate-200" },
};

export default function OrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser, isAuthenticated, isHydrating } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => apiClient.get<Order[]>("/orders"),
    enabled: isAuthenticated && !isHydrating,
  });

  const confirmMutation = useMutation({
    mutationFn: (id: number) => apiClient.patch(`/orders/${id}/confirm`),
    onSuccess: () => {
      toast.success("订单已更新");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: { message?: string }) => toast.error(err.message || "确认失败"),
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => apiClient.patch(`/orders/${id}/complete`),
    onSuccess: () => {
      toast.success("已记录你的确认");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: { message?: string }) => toast.error(err.message || "操作失败"),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => apiClient.patch(`/orders/${id}/cancel`),
    onSuccess: () => {
      toast.success("订单已取消");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: { message?: string }) => toast.error(err.message || "取消失败"),
  });

  const uid = Number(currentUser?.id);

  const filteredOrders = orders.filter((o) =>
    activeTab === "buy" ? o.buyer_id === uid : o.seller_id === uid
  );

  if (isHydrating) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted-foreground">登录后可查看「我的订单」</p>
        <Link href="/login?redirect=/orders" className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
          去登录
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3 flex items-center gap-3">
        <button type="button" onClick={() => router.back()} className="rounded-full p-1.5 hover:bg-muted transition-colors text-lg leading-none">
          ←
        </button>
        <h1 className="font-bold text-lg flex-1">我的订单</h1>
      </div>

      <div className="border-b px-4 flex gap-4 bg-card">
        <button
          type="button"
          onClick={() => setActiveTab("buy")}
          className={`py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "buy" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
          }`}
        >
          我买到的
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sell")}
          className={`py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "sell" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
          }`}
        >
          我卖出的
        </button>
      </div>

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-10">加载中...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center text-muted-foreground py-20 flex flex-col items-center gap-2">
            <Package size={48} className="opacity-20" />
            <p>暂无相关订单</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isBuyer = order.buyer_id === uid;
            return (
              <div key={order.id} className="bg-card border rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <Link href={`/orders/${order.id}`} className="text-xs font-mono text-muted-foreground hover:text-primary underline-offset-2 hover:underline">
                    订单号 O{order.id}
                  </Link>
                  <span className={`text-xs px-2 py-1 rounded-full border ${statusMap[order.status].color}`}>
                    {statusMap[order.status].label}
                  </span>
                </div>

                <div className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-muted overflow-hidden">
                      {order.item_cover ? (
                        <img src={order.item_cover} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-muted-foreground/40" /></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{order.item_title || `商品 #${order.item_id}`}</p>
                      {order.note && (
                        <p className="text-xs text-muted-foreground mt-1 bg-muted p-1.5 rounded truncate">备注: {order.note}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-primary">¥{order.price}</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap justify-end gap-2 border-t border-dashed">
                  {order.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => { if (confirm("确定要取消这个订单吗？此操作不可恢复。")) cancelMutation.mutate(order.id); }}
                        disabled={cancelMutation.isPending}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border hover:bg-muted text-muted-foreground"
                      >
                        取消订单
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmMutation.mutate(order.id)}
                        disabled={confirmMutation.isPending}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                      >
                        确认接单 / 确认订单
                      </button>
                    </>
                  )}
                  {order.status === "confirmed" && (
                    <>
                      <span className="text-[10px] text-muted-foreground self-center mr-auto">
                        {order.completed_by_buyer ? "买家已确认收货" : "买家未确认"} ·{" "}
                        {order.completed_by_seller ? "卖家已确认交付" : "卖家未确认"}
                      </span>
                      <button
                        type="button"
                        onClick={() => completeMutation.mutate(order.id)}
                        disabled={completeMutation.isPending}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                      >
                        <CheckCircle2 size={14} />
                        {isBuyer ? "我已收到物品" : "我已交付物品"}
                      </button>
                    </>
                  )}
                  {(order.status === "completed" || order.status === "cancelled") && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={12} /> {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
