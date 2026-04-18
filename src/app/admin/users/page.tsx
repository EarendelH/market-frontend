"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Ban, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface AdminUser {
  id: number;
  username: string;
  sustech_email: string;
  role: string;
  status: string;
  reputation_trade: number;
  trade_count: number;
  created_at: string;
}

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => apiClient.get<{ items: AdminUser[]; pagination: { total: number } }>("/admin/users", { params: { page_size: 50 } }),
  });

  const users = data?.items ?? [];
  const filtered = search
    ? users.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()) || u.sustech_email.toLowerCase().includes(search.toLowerCase()))
    : users;

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiClient.patch(`/admin/users/${id}/status`, { status }),
    onSuccess: () => {
      toast.success("用户状态已更新");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: { message?: string }) => toast.error(err.message || "操作失败"),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">用户管理</h1>
          <p className="text-muted-foreground">管理平台注册用户，共 {data?.pagination.total ?? 0} 人</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索用户名或邮箱..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">用户名</th>
              <th className="px-6 py-4">邮箱</th>
              <th className="px-6 py-4">信誉</th>
              <th className="px-6 py-4">交易</th>
              <th className="px-6 py-4">状态</th>
              <th className="px-6 py-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">加载中...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">无匹配用户</td></tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-muted-foreground">{user.id}</td>
                  <td className="px-6 py-4 font-medium">{user.username}</td>
                  <td className="px-6 py-4 text-muted-foreground">{user.sustech_email}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${user.reputation_trade < 50 ? "text-red-500" : "text-green-600"}`}>
                      {user.reputation_trade}
                    </span>
                  </td>
                  <td className="px-6 py-4">{user.trade_count}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                      ${user.status === "active" ? "bg-green-100 text-green-700" : 
                        user.status === "banned" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {user.status === "active" ? "正常" : user.status === "banned" ? "已封禁" : "已暂停"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {user.status === "banned" ? (
                      <Button
                        size="sm"
                        onClick={() => statusMutation.mutate({ id: user.id, status: "active" })}
                        disabled={statusMutation.isPending}
                      >
                        <ShieldCheck className="h-4 w-4 mr-1" /> 解封
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => { if (confirm(`确定要封禁用户 ${user.username} 吗？`)) statusMutation.mutate({ id: user.id, status: "banned" }); }}
                        disabled={statusMutation.isPending}
                      >
                        <Ban className="h-4 w-4 mr-1" /> 封禁
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
