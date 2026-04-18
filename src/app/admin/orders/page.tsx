"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface AdminOrder {
  id: number;
  item_id: number;
  item_title: string;
  buyer_id: number;
  buyer_username: string;
  seller_id: number;
  seller_username: string;
  price: number;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "text-amber-600 bg-amber-50 border-amber-200",
  confirmed: "text-blue-600 bg-blue-50 border-blue-200",
  completed: "text-green-600 bg-green-50 border-green-200",
  cancelled: "text-slate-600 bg-slate-50 border-slate-200",
};

const statusLabels: Record<string, string> = {
  pending: "待确认",
  confirmed: "进行中",
  completed: "已完成",
  cancelled: "已取消",
};

export default function OrderManagement() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => apiClient.get<{ items: AdminOrder[]; pagination: { total: number } }>("/admin/orders", { params: { page_size: 50 } }),
  });

  const orders = data?.items ?? [];

  const cancelMutation = useMutation({
    mutationFn: (id: number) => apiClient.patch(`/admin/orders/${id}/cancel`),
    onSuccess: () => {
      toast.success("订单已强制取消");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (err: { message?: string }) => toast.error(err.message || "操作失败"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">订单仲裁</h1>
        <p className="text-muted-foreground">查看所有交易记录，共 {data?.pagination.total ?? 0} 笔订单</p>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4">订单ID</th>
              <th className="px-6 py-4">商品</th>
              <th className="px-6 py-4">买家</th>
              <th className="px-6 py-4">卖家</th>
              <th className="px-6 py-4">金额</th>
              <th className="px-6 py-4">状态</th>
              <th className="px-6 py-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">加载中...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">暂无订单</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 font-mono">O{order.id}</td>
                  <td className="px-6 py-4 font-medium max-w-[160px] truncate">{order.item_title}</td>
                  <td className="px-6 py-4">{order.buyer_username}</td>
                  <td className="px-6 py-4">{order.seller_username}</td>
                  <td className="px-6 py-4 font-bold text-primary">¥{order.price}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={statusColors[order.status] || ""}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {order.status !== "completed" && order.status !== "cancelled" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => { if (confirm("确定要强制取消此订单吗？")) cancelMutation.mutate(order.id); }}
                        disabled={cancelMutation.isPending}
                      >
                        强制取消
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm border border-blue-100">
        <strong>提示：</strong> 如果交易双方发生争议，管理员可以强制取消订单。
      </div>
    </div>
  );
}
