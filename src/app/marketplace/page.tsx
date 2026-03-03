"use client";

import { useState } from "react";
import Link from "next/link";

const categories = ["全部", "书籍教材", "电子产品", "生活用品", "服装", "运动器材", "其他"];

const mockItems = [
  { id: "1",  title: "高等数学教材（第七版）",     price: 25,   originalPrice: 45,   condition: "九成新",   seller: "张同学", time: "2小时前", category: "书籍教材", location: "荔园",   gradient: "from-blue-400 to-blue-600",     emoji: "📚" },
  { id: "2",  title: "AirPods Pro 二代",           price: 1200, originalPrice: 1999, condition: "八成新",   seller: "李同学", time: "5小时前", category: "电子产品", location: "工学院", gradient: "from-slate-400 to-slate-600",   emoji: "🎧" },
  { id: "3",  title: "宿舍护眼台灯",               price: 35,   originalPrice: 89,   condition: "全新未拆", seller: "王同学", time: "1天前",   category: "生活用品", location: "南园",   gradient: "from-amber-400 to-orange-500",  emoji: "💡" },
  { id: "4",  title: "Nike跑鞋 42码",              price: 180,  originalPrice: 560,  condition: "七成新",   seller: "陈同学", time: "1天前",   category: "服装",     location: "体育馆", gradient: "from-red-400 to-rose-600",      emoji: "👟" },
  { id: "5",  title: "机械键盘（青轴）",           price: 220,  originalPrice: 380,  condition: "九成新",   seller: "刘同学", time: "2天前",   category: "电子产品", location: "理学院", gradient: "from-emerald-400 to-green-600", emoji: "⌨️" },
  { id: "6",  title: "算法导论（英文第3版）",      price: 60,   originalPrice: 128,  condition: "八成新",   seller: "赵同学", time: "3天前",   category: "书籍教材", location: "图书馆", gradient: "from-violet-400 to-purple-600", emoji: "📖" },
  { id: "7",  title: "瑜伽垫（全新未拆封）",       price: 45,   originalPrice: 88,   condition: "全新",     seller: "孙同学", time: "3天前",   category: "运动器材", location: "南园",   gradient: "from-teal-400 to-cyan-600",     emoji: "🧘" },
  { id: "8",  title: "iPad mini 6 WiFi 256G",      price: 2800, originalPrice: 3799, condition: "九成新",   seller: "周同学", time: "4天前",   category: "电子产品", location: "工学院", gradient: "from-zinc-400 to-gray-600",     emoji: "📱" },
  { id: "9",  title: "线性代数（同济第六版）",     price: 15,   originalPrice: 32,   condition: "八成新",   seller: "吴同学", time: "5天前",   category: "书籍教材", location: "荔园",   gradient: "from-indigo-400 to-blue-600",   emoji: "📐" },
  { id: "10", title: "电动牙刷（Oral-B）",         price: 80,   originalPrice: 199,  condition: "九成新",   seller: "郑同学", time: "5天前",   category: "生活用品", location: "北园",   gradient: "from-sky-400 to-blue-500",      emoji: "🪥" },
  { id: "11", title: "哑铃一对 5kg×2",             price: 55,   originalPrice: 120,  condition: "九成新",   seller: "钱同学", time: "6天前",   category: "运动器材", location: "体育馆", gradient: "from-stone-400 to-stone-600",   emoji: "🏋️" },
  { id: "12", title: "优衣库羽绒服 M码",           price: 120,  originalPrice: 399,  condition: "九成新",   seller: "冯同学", time: "1周前",   category: "服装",     location: "北园",   gradient: "from-blue-300 to-indigo-400",   emoji: "🧥" },
];

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = mockItems.filter((item) => {
    const matchCat = selectedCategory === "全部" || item.category === selectedCategory;
    const matchSearch = !searchQuery || item.title.includes(searchQuery);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen">
      {/* Sticky search + filter header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base leading-none pointer-events-none">🔍</span>
            <input
              type="text"
              placeholder="搜索校园好物..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-muted pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all"
            />
          </div>
          <button className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 active:scale-95 transition-all flex items-center gap-1">
            <span className="text-base leading-none">＋</span>
            <span className="hidden sm:inline">发布</span>
          </button>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch] pb-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="p-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((item) => (
          <Link key={item.id} href={`/marketplace/${item.id}`}>
            <article className="bg-card rounded-2xl overflow-hidden border hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]">
              {/* Gradient image placeholder */}
              <div className={`aspect-square bg-gradient-to-br ${item.gradient} flex items-center justify-center relative`}>
                <span className="text-4xl drop-shadow-sm">{item.emoji}</span>
                <span className="absolute top-2 right-2 rounded-full bg-black/25 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                  {item.condition}
                </span>
              </div>

              {/* Info */}
              <div className="p-3 space-y-1.5">
                <p className="text-sm font-medium leading-snug line-clamp-2">{item.title}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-bold">¥{item.price}</span>
                  <span className="text-xs text-muted-foreground line-through">¥{item.originalPrice}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>📍 {item.location}</span>
                  <span>{item.time}</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-3">
          <span className="text-6xl">🫙</span>
          <p className="font-medium">暂无相关商品</p>
          <p className="text-sm">换个关键词试试？</p>
        </div>
      )}
    </div>
  );
}
