"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Package, Clock, ShieldCheck, MapPin, MessageSquare, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => apiClient.get<any>(`/orders/${id}`),
  });

  const { data: item } = useQuery({
    queryKey: ["item", order?.item_id],
    queryFn: () => apiClient.get<any>(`/items/${order?.item_id}`),
    enabled: !!order?.item_id,
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">正在加载订单详情...</div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">找不到该订单</div>;

  const statusMap: Record<string, { label: string; color: string; desc: string }> = {
    pending: { label: "等待确认", color: "text-amber-600 bg-amber-50 border-amber-200", desc: "卖家还未确认此订单，请耐心等待。" },
    confirmed: { label: "进行中", color: "text-blue-600 bg-blue-50 border-blue-200", desc: "卖家已确认订单，请尽快完成线下交易。" },
    completed: { label: "已完成", color: "text-green-600 bg-green-50 border-green-200", desc: "交易已顺利结束。" },
    cancelled: { label: "已取消", color: "text-slate-600 bg-slate-50 border-slate-200", desc: "该订单已被取消。" },
  };

  const currentStatus = statusMap[order.status] || statusMap.pending;

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="bg-background border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-muted rounded-full">
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
                {item.cover_images?.[0] ? <img src={item.cover_images[0]} className="w-full h-full object-cover" /> : <Package className="m-auto h-full text-muted-foreground/30" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm group-hover:text-primary transition-colors">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">点击查看商品快照</p>
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
            <span className="font-mono">{order.id}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">成交价格</span>
            <span className="font-bold text-primary text-lg">¥{order.price}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">创建时间</span>
            <span>{new Date(order.created_at).toLocaleString()}</span>
          </div>
          {order.note && (
            <div className="pt-2 border-t mt-2">
              <span className="text-xs text-muted-foreground mb-1 block flex items-center gap-1"><MessageSquare size={12}/> 买家留言</span>
              <div className="bg-muted/50 p-3 rounded-xl text-sm leading-relaxed">{order.note}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}