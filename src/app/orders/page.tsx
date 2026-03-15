"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { Package, Clock, CheckCircle2, XCircle } from "lucide-react";

interface Order {
  id: number;
  item_id: number;
  buyer_id: number;
  seller_id: number;
  price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  note: string | null;
  created_at: string;
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
  const currentUser = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");

  // 获取用户的所有订单
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => apiClient.get<Order[]>("/orders"),
  });

  // 状态变更 Mutations
  const confirmMutation = useMutation({
    mutationFn: (id: number) => apiClient.patch(`/orders/${id}/confirm`),
    onSuccess: () => {
      toast.success("订单已确认");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => toast.error(err.message || "确认失败"),
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => apiClient.patch(`/orders/${id}/complete`),
    onSuccess: () => {
      toast.success("已标记完成！");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => toast.error(err.message || "操作失败"),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => apiClient.patch(`/orders/${id}/cancel`),
    onSuccess: () => {
      toast.success("订单已取消");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => toast.error(err.message || "取消失败"),
  });

  // 过滤买入和卖出的订单
  const filteredOrders = orders.filter((o) =>
    activeTab === "buy"
      ? o.buyer_id === Number(currentUser?.id)
      : o.seller_id === Number(currentUser?.id)
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-full p-1.5 hover:bg-muted transition-colors text-lg leading-none">←</button>
        <h1 className="font-bold text-lg flex-1">我的订单</h1>
      </div>

      <div className="border-b px-4 flex gap-4 bg-card">
        <button
          onClick={() => setActiveTab("buy")}
          className={`py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === "buy" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}
        >
          我买到的
        </button>
        <button
          onClick={() => setActiveTab("sell")}
          className={`py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === "sell" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}
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
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-card border rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-xs font-mono text-muted-foreground">订单号: #{order.id}</span>
                <span className={`text-xs px-2 py-1 rounded-full border ${statusMap[order.status].color}`}>
                  {statusMap[order.status].label}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">商品 ID: {order.item_id}</p>
                  {order.note && <p className="text-xs text-muted-foreground mt-1 bg-muted p-1.5 rounded">备注: {order.note}</p>}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">¥{order.price}</p>
                </div>
              </div>

              {/* 操作按钮组 */}
              <div className="pt-2 flex justify-end gap-2 border-t border-dashed">
                {order.status === "pending" && (
                  <>
                    <button
                      onClick={() => cancelMutation.mutate(order.id)}
                      disabled={cancelMutation.isPending}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border hover:bg-muted text-muted-foreground"
                    >
                      取消订单
                    </button>
                    <button
                      onClick={() => confirmMutation.mutate(order.id)}
                      disabled={confirmMutation.isPending}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                    >
                      确认订单
                    </button>
                  </>
                )}
                {order.status === "confirmed" && (
                  <button
                    onClick={() => completeMutation.mutate(order.id)}
                    disabled={completeMutation.isPending}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                  >
                    <CheckCircle2 size={14} /> 标记为已完成
                  </button>
                )}
                {(order.status === "completed" || order.status === "cancelled") && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock size={12} /> {new Date(order.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}