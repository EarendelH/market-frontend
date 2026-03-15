"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ShoppingBag, GraduationCap, Search, Plus, Package } from "lucide-react";

interface Item {
  id: number;
  type: string;
  title: string;
  price: number;
  condition?: string;
  location_text?: string;
  created_at: string;
  cover_images: string[];
}

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<'item' | 'skill'>('item');
  const [searchQuery, setSearchQuery] = useState("");

  // 获取商品数据，将 isError 也解构出来用于错误状态判断
  const { data, isLoading, isError } = useQuery({
    queryKey: ["items", activeTab, searchQuery],
    queryFn: () => apiClient.get<any>("/items", {
      params: { type: activeTab, keyword: searchQuery }
    }),
  });

  // 终极保底逻辑：判断 data 到底是什么格式，确保 items 永远是一个数组，防止 .map 崩溃
  const items = Array.isArray(data) ? data : (data?.items || []);

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3 space-y-3">
        <div className="flex p-1 bg-muted/50 rounded-xl">
          <button onClick={() => setActiveTab('item')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg ${activeTab === 'item' ? 'bg-background shadow-sm text-blue-600' : 'text-muted-foreground'}`}>
            <ShoppingBag size={16} /> <span>校园闲置</span>
          </button>
          <button onClick={() => setActiveTab('skill')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg ${activeTab === 'skill' ? 'bg-background shadow-sm text-purple-600' : 'text-muted-foreground'}`}>
            <GraduationCap size={16} /> <span>技能交换</span>
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><Search size={16} /></span>
            <input
              type="text"
              placeholder={activeTab === 'item' ? "搜索闲置..." : "搜索技能..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-muted pl-9 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Link href="/publish" className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground flex items-center gap-1 shadow-sm">
            <Plus size={18} /> 发布
          </Link>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {isLoading ? (
          <p className="col-span-full text-center text-muted-foreground py-10">加载中...</p>
        ) : isError ? (
          <p className="col-span-full text-center text-red-500 py-10">获取数据失败，请确保后端服务已启动并已重启前端服务</p>
        ) : items.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground py-10">暂无数据</p>
        ) : (
          items.map((item: Item) => (
            <Link key={item.id} href={`/marketplace/${item.id}`}>
              <article className="bg-card rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-all h-full flex flex-col">
                <div className="aspect-square bg-muted relative">
                  {item.cover_images?.[0] ? (
                    <img src={item.cover_images[0]} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground opacity-50">
                       <Package size={48} />
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1 justify-between">
                  <h3 className="text-sm font-medium line-clamp-2">{item.title}</h3>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-base font-bold text-primary">¥{item.price}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}