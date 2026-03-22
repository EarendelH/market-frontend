"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Trash2, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";

interface AdminItem {
  id: number;
  title: string;
  owner_id: number;
  owner_username: string;
  price: number;
  status: string;
  type: string;
}

export default function ItemManagement() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "items"],
    queryFn: () => apiClient.get<{ items: AdminItem[]; pagination: { total: number } }>("/admin/items", { params: { page_size: 50 } }),
  });

  const items = data?.items ?? [];

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiClient.patch(`/admin/items/${id}/status`, { status }),
    onSuccess: () => {
      toast.success("商品状态已更新");
      queryClient.invalidateQueries({ queryKey: ["admin", "items"] });
    },
    onError: (err: { message?: string }) => toast.error(err.message || "操作失败"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/admin/items/${id}`),
    onSuccess: () => {
      toast.success("商品已删除");
      queryClient.invalidateQueries({ queryKey: ["admin", "items"] });
    },
    onError: (err: { message?: string }) => toast.error(err.message || "删除失败"),
  });

  const statusLabel = (s: string) => {
    switch (s) {
      case "active": return { text: "在售", cls: "bg-green-100 text-green-700" };
      case "inactive": return { text: "已下架", cls: "bg-slate-100 text-slate-600" };
      case "sold": return { text: "已售出", cls: "bg-blue-100 text-blue-700" };
      case "removed": return { text: "已删除", cls: "bg-red-100 text-red-700" };
      default: return { text: s, cls: "bg-muted text-muted-foreground" };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">商品管理</h1>
        <p className="text-muted-foreground">共 {data?.pagination.total ?? 0} 件商品</p>
      </div>
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">标题</th>
              <th className="px-6 py-4">发布者</th>
              <th className="px-6 py-4">价格</th>
              <th className="px-6 py-4">类型</th>
              <th className="px-6 py-4">状态</th>
              <th className="px-6 py-4 text-right">管理</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">加载中...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">暂无商品</td></tr>
            ) : (
              items.map((item) => {
                const sl = statusLabel(item.status);
                return (
                  <tr key={item.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 font-mono text-muted-foreground">{item.id}</td>
                    <td className="px-6 py-4 font-medium max-w-[200px] truncate">{item.title}</td>
                    <td className="px-6 py-4">{item.owner_username}</td>
                    <td className="px-6 py-4">¥{item.price}</td>
                    <td className="px-6 py-4">{item.type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${sl.cls}`}>{sl.text}</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {item.status === "active" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                          onClick={() => statusMutation.mutate({ id: item.id, status: "inactive" })}
                          disabled={statusMutation.isPending}
                        >
                          <EyeOff className="h-4 w-4 mr-1" /> 下架
                        </Button>
                      ) : item.status === "inactive" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => statusMutation.mutate({ id: item.id, status: "active" })}
                          disabled={statusMutation.isPending}
                        >
                          <Eye className="h-4 w-4 mr-1" /> 上架
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => { if (confirm("确定要删除此商品吗？")) deleteMutation.mutate(item.id); }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> 删除
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
