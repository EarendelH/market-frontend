"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, EyeOff } from "lucide-react";

const initialItems = [
  { id: "123", title: "线性代数教材", seller: "小明", status: "在售", price: 15 },
  { id: "124", title: "代写作业服务", seller: "User_Unknown", status: "违规", price: 200 },
];

export default function ItemManagement() {
  const [items, setItems] = useState(initialItems);

  const deleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">商品管理</h1>
      <div className="rounded-xl border bg-card shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4">商品ID</th>
              <th className="px-6 py-4">标题</th>
              <th className="px-6 py-4">发布者</th>
              <th className="px-6 py-4">价格</th>
              <th className="px-6 py-4">状态</th>
              <th className="px-6 py-4 text-right">管理</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 font-mono text-muted-foreground">{item.id}</td>
                <td className="px-6 py-4 font-medium">{item.title}</td>
                <td className="px-6 py-4">{item.seller}</td>
                <td className="px-6 py-4">¥{item.price}</td>
                <td className="px-6 py-4">{item.status}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                    <EyeOff className="h-4 w-4 mr-1" /> 下架
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> 删除
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