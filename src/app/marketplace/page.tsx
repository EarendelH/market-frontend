
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ShoppingBag, 
  GraduationCap, 
  Search, 
  Plus, 
  X, 
  Package, 
  Zap 
} from "lucide-react";

// --- 1. 定义数据接口与 Mock 数据 ---

interface MarketItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  unit?: string;
  condition: string;
  seller: string;
  time: string;
  category: string;
  location: string;
  gradient: string;
  emoji: string;
  type: 'goods' | 'skill';
}

const mockItems: MarketItem[] = [
  // --- 闲置物品 (Goods) ---
  { id: "1",  title: "高等数学教材（第七版）",     price: 25,   originalPrice: 45,   condition: "九成新",   seller: "张同学", time: "2小时前", category: "书籍教材", location: "荔园",   gradient: "from-blue-400 to-blue-600",     emoji: "📚", type: 'goods' },
  { id: "2",  title: "AirPods Pro 二代",           price: 1200, originalPrice: 1999, condition: "八成新",   seller: "李同学", time: "5小时前", category: "电子产品", location: "工学院", gradient: "from-slate-400 to-slate-600",   emoji: "🎧", type: 'goods' },
  { id: "3",  title: "宿舍护眼台灯",               price: 35,   originalPrice: 89,   condition: "全新未拆", seller: "王同学", time: "1天前",   category: "生活用品", location: "南园",   gradient: "from-amber-400 to-orange-500",  emoji: "💡", type: 'goods' },
  { id: "4",  title: "Nike跑鞋 42码",              price: 180,  originalPrice: 560,  condition: "七成新",   seller: "陈同学", time: "1天前",   category: "服装",     location: "体育馆", gradient: "from-red-400 to-rose-600",      emoji: "👟", type: 'goods' },
  { id: "5",  title: "机械键盘（青轴）",           price: 220,  originalPrice: 380,  condition: "九成新",   seller: "刘同学", time: "2天前",   category: "电子产品", location: "理学院", gradient: "from-emerald-400 to-green-600", emoji: "⌨️", type: 'goods' },
  
  // --- 技能服务 (Skills) ---
  { id: "s1", title: "Python 数据分析辅导",        price: 50,   unit: "/小时",       condition: "专业",     seller: "极客社", time: "1小时前", category: "学业辅导", location: "线上",   gradient: "from-yellow-400 to-amber-600",  emoji: "🐍", type: 'skill' },
  { id: "s2", title: "校园人像摄影/毕业照",        price: 88,   unit: "/组",         condition: "接单中",   seller: "摄影协", time: "3小时前", category: "摄影设计", location: "校内",   gradient: "from-pink-400 to-rose-600",     emoji: "📸", type: 'skill' },
  { id: "s3", title: "PPT 美化设计/答辩排版",      price: 30,   unit: "/份",         condition: "加急",     seller: "设计系", time: "1天前",   category: "摄影设计", location: "线上",   gradient: "from-cyan-400 to-blue-600",     emoji: "🎨", type: 'skill' },
  { id: "s4", title: "吉他入门教学（一对一）",      price: 60,   unit: "/课时",       condition: "周末",     seller: "音乐社", time: "2天前",   category: "才艺教学", location: "琴房",   gradient: "from-orange-400 to-red-500",    emoji: "🎸", type: 'skill' },
  { id: "s5", title: "跑腿/代取快递",              price: 5,    unit: "/次",         condition: "空闲",     seller: "王跑跑", time: "10分前",  category: "生活服务", location: "北园",   gradient: "from-green-400 to-teal-500",    emoji: "🏃", type: 'skill' },
];

const GOODS_CATEGORIES = ["全部", "书籍教材", "电子产品", "生活用品", "服装", "运动器材", "其他"];
const SKILL_CATEGORIES = ["全部", "学业辅导", "摄影设计", "才艺教学", "生活服务", "游戏陪玩", "其他"];

// --- 骨架屏组件 (保留但默认不显示) ---
const ItemSkeleton = () => (
  <div className="bg-card rounded-2xl overflow-hidden border shadow-sm h-full flex flex-col">
    <div className="aspect-square bg-muted animate-pulse" />
    <div className="p-3 space-y-2 flex-1">
      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
      <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
      <div className="flex justify-between items-end mt-2">
        <div className="h-5 bg-muted animate-pulse rounded w-1/3" />
        <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
      </div>
    </div>
  </div>
);

export default function MarketplacePage() {
  // --- 2. 状态管理 ---
  const [activeTab, setActiveTab] = useState<'goods' | 'skill'>('goods');
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  
  // [修改] 默认为 false，不显示 Loading 骨架屏
  const [isLoading, setIsLoading] = useState(false);
  
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);

  // [修改] 删除了模拟延迟的 useEffect

  // 切换 Tab 重置分类
  useEffect(() => {
    setSelectedCategory("全部");
    setSearchQuery("");
  }, [activeTab]);

  const currentCategories = activeTab === 'goods' ? GOODS_CATEGORIES : SKILL_CATEGORIES;

  // --- 3. 过滤逻辑 ---
  const filteredItems = mockItems.filter((item) => {
    const matchType = item.type === activeTab;
    const matchCat = selectedCategory === "全部" || item.category === selectedCategory;
    const matchSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3 space-y-3">
        
        {/* Tab 切换 */}
        <div className="flex p-1 bg-muted/50 rounded-xl">
          <button
            onClick={() => setActiveTab('goods')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'goods' 
                ? 'bg-background shadow-sm text-blue-600' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShoppingBag size={16} /> 
            <span>校园闲置</span>
          </button>
          <button
            onClick={() => setActiveTab('skill')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'skill' 
                ? 'bg-background shadow-sm text-purple-600' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <GraduationCap size={16} /> 
            <span>技能交换</span>
          </button>
        </div>

        {/* 搜索栏与发布按钮 */}
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder={activeTab === 'goods' ? "搜索教材、耳机..." : "搜索辅导、摄影..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-muted pl-9 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {/* AI 匹配按钮 */}
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors" title="AI 智能匹配">
               <Sparkles size={18} className="animate-pulse" />
            </button>
          </div>
          
          {/* 发布按钮 */}
          <button 
            onClick={() => setIsPublishDialogOpen(true)}
            className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">发布</span>
          </button>
        </div>

        {/* Categories Chips */}
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch] pb-1">
          {currentCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      <div className="p-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {/* 根据 isLoading 状态显示 */}
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <ItemSkeleton key={i} />)
        ) : (
          <>
            {filteredItems.map((item) => (
              <Link key={item.id} href={`/marketplace/${item.id}`}>
                <article className="bg-card rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] h-full flex flex-col">
                  
                  {/* 图片区域 */}
                  <div className={`aspect-square bg-gradient-to-br ${item.gradient} flex items-center justify-center relative`}>
                    <span className="text-4xl drop-shadow-sm transform group-hover:scale-110 transition-transform">{item.emoji}</span>
                    <span className="absolute top-2 right-2 rounded-full bg-black/20 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-white border border-white/10">
                      {item.condition}
                    </span>
                    {item.type === 'skill' && (
                      <span className="absolute bottom-2 left-2 rounded px-1.5 py-0.5 text-[10px] font-bold bg-white/90 text-purple-600 shadow-sm">
                        技能
                      </span>
                    )}
                  </div>

                  {/* 信息区域 */}
                  <div className="p-3 flex flex-col flex-1 justify-between space-y-2">
                    <div>
                      <h3 className="text-sm font-medium leading-snug line-clamp-2 text-card-foreground">
                        {item.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span className="bg-muted px-1 rounded">{item.category}</span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="flex items-baseline gap-1">
                        {activeTab === 'skill' ? (
                           <div className="flex flex-col">
                             <span className="text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                                {item.price > 0 ? `¥${item.price}${item.unit}` : '免费交换'}
                             </span>
                           </div>
                        ) : (
                           <>
                            <span className="text-base font-bold text-primary">¥{item.price}</span>
                            {item.originalPrice && (
                              <span className="text-[10px] text-muted-foreground line-through decoration-muted-foreground/50">
                                ¥{item.originalPrice}
                              </span>
                            )}
                           </>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5 max-w-[60%] truncate">
                        📍 {item.location}
                      </span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </>
        )}
      </div>

      {/* Empty State */}
      {!isLoading && filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-3xl">
            🫙
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">暂无相关{activeTab === 'goods' ? '物品' : '技能'}</p>
            <p className="text-sm mt-1">换个关键词，或者试试 <span className="text-purple-600 font-medium">AI 智能匹配</span></p>
          </div>
        </div>
      )}

      {/* 发布引导弹窗 (Dialog) */}
      {isPublishDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">你要发布什么？</h2>
              <button 
                onClick={() => setIsPublishDialogOpen(false)}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center gap-3 h-32 rounded-2xl border-2 border-muted hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Package size={24} />
                </div>
                <span className="font-semibold text-sm text-foreground">闲置物品</span>
              </button>
              
              <button className="flex flex-col items-center justify-center gap-3 h-32 rounded-2xl border-2 border-muted hover:border-purple-500 hover:bg-purple-50 transition-all group">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                  <Zap size={24} />
                </div>
                <span className="font-semibold text-sm text-foreground">个人技能</span>
              </button>
            </div>
            
            <p className="text-xs text-center text-muted-foreground mt-6">
              发布即代表同意《校园交易公约》
            </p>
          </div>
        </div>
      )}
    </div>
  );
}