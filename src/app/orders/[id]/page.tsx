"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { Package, ShieldCheck, MessageSquare, ChevronLeft, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => apiClient.get<Record<string, unknown>>(`/orders/${id}`),
  });

  type ItemBrief = { id: number; title: string; cover_images?: string[] };

  const { data: item } = useQuery({
    queryKey: ["item", order && (order as { item_id?: number }).item_id],
    queryFn: () => apiClient.get<ItemBrief>(`/items/${(order as { item_id: number }).item_id}`),
    enabled: !!(order && (order as { item_id?: number }).item_id),
  });

  const confirmMutation = useMutation({
    mutationFn: () => apiClient.patch(`/orders/${id}/confirm`),
    onSuccess: () => {
      toast.success("订单状态已更新");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: { message?: string }) => toast.error(err.message || "操作失败"),
  });

  const completeMutation = useMutation({
    mutationFn: () => apiClient.patch(`/orders/${id}/complete`),
    onSuccess: () => {
      toast.success("已记录你的确认");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: { message?: string }) => toast.error(err.message || "操作失败"),
  });

  const cancelMutation = useMutation({
    mutationFn: () => apiClient.patch(`/orders/${id}/cancel`),
    onSuccess: () => {
      toast.success("订单已取消");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: { message?: string }) => toast.error(err.message || "操作失败"),
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">正在加载订单详情...</div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">找不到该订单</div>;

  const o = order as {
    id: number;
    item_id: number;
    buyer_id: number;
    seller_id: number;
    price: number;
    status: string;
    note?: string | null;
    created_at: string;
    completed_by_buyer?: boolean;
    completed_by_seller?: boolean;
  };

  const uid = Number(user?.id);
  const isBuyer = o.buyer_id === uid;

  const statusMap: Record<string, { label: string; color: string; desc: string }> = {
    pending: { label: "等待确认", color: "text-amber-600 bg-amber-50 border-amber-200", desc: "卖家或买家确认后进入进行中。" },
    confirmed: { label: "进行中", color: "text-blue-600 bg-blue-50 border-blue-200", desc: "线下见面交易后，双方分别点击完成。" },
    completed: { label: "已完成", color: "text-green-600 bg-green-50 border-green-200", desc: "交易已顺利结束。" },
    cancelled: { label: "已取消", color: "text-slate-600 bg-slate-50 border-slate-200", desc: "该订单已被取消。" },
  };

  const currentStatus = statusMap[o.status] || statusMap.pending;

  return (
    <div className="min-h-screen bg-muted/30 pb-28">
      <div className="bg-background border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button type="button" onClick={() => router.back()} className="p-1.5 hover:bg-muted rounded-full">
          <ChevronLeft size={24} />
        </button>
        <span className="font-bold">订单详情</span>
      </div>

      <div className={`${currentStatus.color} px-6 py-8 border-b`}>
        <h1 className="text-2xl font-bold mb-2">{currentStatus.label}</h1>
        <p className="text-sm opacity-90">{currentStatus.desc}</p>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <div className="bg-background rounded-2xl p-4 border shadow-sm">
          <h2 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
            <Package size={16} /> 关联商品
          </h2>
          {item ? (
            <Link href={`/marketplace/${item.id}`} className="flex gap-3 items-center group">
              <div className="h-16 w-16 bg-muted rounded-xl overflow-hidden shrink-0">
                {item.cover_images?.[0] ? (
                  <img src={item.cover_images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Package className="m-auto h-full text-muted-foreground/30" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm group-hover:text-primary transition-colors">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">点击查看商品</p>
              </div>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">商品信息加载中或已失效</p>
          )}
        </div>

        <div className="bg-background rounded-2xl p-4 border shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-muted-foreground flex items-center gap-2 border-b pb-2">
            <ShieldCheck size={16} /> 交易信息
          </h2>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">订单编号</span>
            <span className="font-mono">O{o.id}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">成交价格</span>
            <span className="font-bold text-primary text-lg">¥{o.price}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">创建时间</span>
            <span>{new Date(o.created_at).toLocaleString()}</span>
          </div>
          {o.note && (
            <div className="pt-2 border-t mt-2">
              <span className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                <MessageSquare size={12} /> 留言
              </span>
              <div className="bg-muted/50 p-3 rounded-xl text-sm leading-relaxed">{o.note}</div>
            </div>
          )}
        </div>

        <Link
          href="/map"
          className="flex items-center justify-center gap-2 rounded-2xl border bg-background p-4 text-sm font-medium hover:bg-muted/50 transition-colors"
        >
          <MapPin size={18} className="text-primary" />
          导航到校园交易地图（约定见面点）
        </Link>

        <div className="flex flex-col gap-2">
          {o.status === "pending" && (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
                取消订单
              </Button>
              <Button className="flex-1 rounded-xl" onClick={() => confirmMutation.mutate()} disabled={confirmMutation.isPending}>
                确认
              </Button>
            </div>
          )}
          {o.status === "confirmed" && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                双方均确认后订单完成。当前：{o.completed_by_buyer ? "买家✓" : "买家…"} · {o.completed_by_seller ? "卖家✓" : "卖家…"}
              </p>
              <Button className="w-full rounded-xl bg-green-600 hover:bg-green-700" onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isBuyer ? "我已收到物品" : "我已交付物品"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
