"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function OrderManagement() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">订单仲裁</h1>
      <p className="text-muted-foreground">查看所有交易记录，处理买卖双方纠纷。</p>

      <div className="rounded-xl border bg-card shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4">订单ID</th>
              <th className="px-6 py-4">商品</th>
              <th className="px-6 py-4">买家</th>
              <th className="px-6 py-4">卖家</th>
              <th className="px-6 py-4">状态</th>
              <th className="px-6 py-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="px-6 py-4 font-mono">ORD-2024-001</td>
              <td className="px-6 py-4">AirPods Pro</td>
              <td className="px-6 py-4">李同学</td>
              <td className="px-6 py-4">王同学</td>
              <td className="px-6 py-4"><Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">纠纷中</Badge></td>
              <td className="px-6 py-4 text-right">
                <Button size="sm" variant="secondary">查看聊天记录</Button>
                <Button size="sm" variant="destructive" className="ml-2">强制取消</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm border border-blue-100">
        <strong>提示：</strong> 如果交易双方发生争议（例如商品描述不符），管理员可以调取该订单关联的聊天记录进行取证。
      </div>
    </div>
  );
}