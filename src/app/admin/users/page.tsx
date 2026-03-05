"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, Search, Ban, RotateCcw } from "lucide-react";

// Mock Data
const initialUsers = [
  { id: "U001", name: "小明", email: "xiaoming@mail.sustech.edu.cn", score: 4.6, deals: 12, status: "正常" },
  { id: "U002", name: "小红", email: "xiaohong@mail.sustech.edu.cn", score: 2.1, deals: 3, status: "警告" },
  { id: "U003", name: "Spammer", email: "spam@fake.com", score: 0, deals: 0, status: "已封禁" },
];

export default function UserManagement() {
  const [users, setUsers] = useState(initialUsers);

  const toggleBan = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === "已封禁" ? "正常" : "已封禁" } : u));
  };

  const resetScore = (id: string) => {
    if(confirm("确定重置该用户信誉分吗？")) {
        setUsers(users.map(u => u.id === id ? { ...u, score: 5.0 } : u));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">用户管理</h1>
          <p className="text-muted-foreground">管理平台注册用户、处理违规账号。</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索用户ID或邮箱..." className="pl-8" />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
            <tr>
              <th className="px-6 py-4">用户ID</th>
              <th className="px-6 py-4">邮箱</th>
              <th className="px-6 py-4">信誉分</th>
              <th className="px-6 py-4">交易次数</th>
              <th className="px-6 py-4">状态</th>
              <th className="px-6 py-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium">{user.name} <span className="text-xs text-muted-foreground ml-1">({user.id})</span></td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`font-bold ${user.score < 3 ? "text-red-500" : "text-green-600"}`}>{user.score}</span>
                </td>
                <td className="px-6 py-4">{user.deals}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                    ${user.status === '正常' ? 'bg-green-100 text-green-700' : 
                      user.status === '已封禁' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => resetScore(user.id)} title="重置信誉分">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant={user.status === "已封禁" ? "default" : "destructive"}
                    onClick={() => toggleBan(user.id)}
                  >
                    {user.status === "已封禁" ? "解封" : "封禁"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}