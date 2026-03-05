"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, Zap } from "lucide-react"; // 引入图标区分类型

// --- 1. 使用最新的数据结构 ---
interface MarketItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  unit?: string;          // 新增：单位
  condition: string;
  seller: string;
  sellerAvatar?: string;  // 兼容旧数据，设为可选或补全
  sellerRating?: number;
  sellerDeals?: number;
  time: string;
  category: string;
  location: string;
  gradient: string;
  emoji: string;
  description?: string;   // 兼容
  type: 'goods' | 'skill'; // 新增：类型
}

// 补全后的 Mock 数据（合并了详情页需要的 description 字段）
const mockItems: MarketItem[] = [
  // --- 闲置物品 (Goods) ---
  { id: "1",  title: "高等数学教材（第七版）",     price: 25,   originalPrice: 45,   condition: "九成新",   seller: "张同学", sellerAvatar: "张", sellerRating: 4.9, sellerDeals: 12, time: "2小时前", category: "书籍教材", location: "荔园",   gradient: "from-blue-400 to-blue-600",     emoji: "📚", type: 'goods', description: "同济版高数上下册，笔记不多，内容清晰。考完研不再需要，价格实惠。自提或可约图书馆门口交易。" },
  { id: "2",  title: "AirPods Pro 二代",           price: 1200, originalPrice: 1999, condition: "八成新",   seller: "李同学", sellerAvatar: "李", sellerRating: 5.0, sellerDeals: 8,  time: "5小时前", category: "电子产品", location: "工学院", gradient: "from-slate-400 to-slate-600",   emoji: "🎧", type: 'goods', description: "Apple AirPods Pro 第二代，含原装充电盒及数据线。电池健康度92%，降噪效果依旧出色。仅因换了其他耳机出售。" },
  { id: "3",  title: "宿舍护眼台灯",               price: 35,   originalPrice: 89,   condition: "全新未拆", seller: "王同学", sellerAvatar: "王", sellerRating: 4.8, sellerDeals: 5,  time: "1天前",   category: "生活用品", location: "南园",   gradient: "from-amber-400 to-orange-500",  emoji: "💡", type: 'goods', description: "小米全光谱护眼台灯，全新未拆封，收到礼物但已有同款。支持多档调光，USB充电。" },
  { id: "4",  title: "Nike跑鞋 42码",              price: 180,  originalPrice: 560,  condition: "七成新",   seller: "陈同学", sellerAvatar: "陈", sellerRating: 4.7, sellerDeals: 3,  time: "1天前",   category: "服装",     location: "体育馆", gradient: "from-red-400 to-rose-600",      emoji: "👟", type: 'goods', description: "Nike Air Zoom Pegasus 40，42码，黑白配色。日常训练用，鞋面干净，鞋底磨损正常。因脚型不合出售。" },
  { id: "5",  title: "机械键盘（青轴）",           price: 220,  originalPrice: 380,  condition: "九成新",   seller: "刘同学", sellerAvatar: "刘", sellerRating: 4.9, sellerDeals: 20, time: "2天前",   category: "电子产品", location: "理学院", gradient: "from-emerald-400 to-green-600", emoji: "⌨️", type: 'goods', description: "IKBC C87机械键盘，87键布局，青轴，PBT双色键帽，打字手感极佳。附赠原装键帽拔键器。" },
  
  // --- 技能服务 (Skills) ---
  { id: "s1", title: "Python 数据分析辅导",        price: 50,   unit: "/小时",       condition: "专业",     seller: "极客社", sellerAvatar: "极", sellerRating: 5.0, sellerDeals: 30, time: "1小时前", category: "学业辅导", location: "线上",   gradient: "from-yellow-400 to-amber-600",  emoji: "🐍", type: 'skill', description: "计算机系大神一对一辅导，擅长Pandas、NumPy、Matplotlib。从入门到大作业指导，包教包会。" },
  { id: "s2", title: "校园人像摄影/毕业照",        price: 88,   unit: "/组",         condition: "接单中",   seller: "摄影协", sellerAvatar: "摄", sellerRating: 4.9, sellerDeals: 15, time: "3小时前", category: "摄影设计", location: "校内",   gradient: "from-pink-400 to-rose-600",     emoji: "📸", type: 'skill', description: "南科大摄影协会资深摄影师，索尼A7M4设备。包含前期沟通、拍摄1小时及后期精修9张。风格清新自然。" },
  { id: "s3", title: "PPT 美化设计/答辩排版",      price: 30,   unit: "/份",         condition: "加急",     seller: "设计系", sellerAvatar: "设", sellerRating: 4.8, sellerDeals: 42, time: "1天前",   category: "摄影设计", location: "线上",   gradient: "from-cyan-400 to-blue-600",     emoji: "🎨", type: 'skill', description: "专业PPT设计，针对课程展示、毕业答辩等场景。提供逻辑梳理、排版美化、图表制作服务。急单可接。" },
  { id: "s4", title: "吉他入门教学（一对一）",      price: 60,   unit: "/课时",       condition: "周末",     seller: "音乐社", sellerAvatar: "音", sellerRating: 5.0, sellerDeals: 8,  time: "2天前",   category: "才艺教学", location: "琴房",   gradient: "from-orange-400 to-red-500",    emoji: "🎸", type: 'skill', description: "民谣吉他零基础入门，手把手教学。教你识谱、按弦、扫弦，三节课学会弹唱《成都》。" },
  { id: "s5", title: "跑腿/代取快递",              price: 5,    unit: "/次",         condition: "空闲",     seller: "王跑跑", sellerAvatar: "跑", sellerRating: 4.7, sellerDeals: 100,time: "10分前",  category: "生活服务", location: "北园",   gradient: "from-green-400 to-teal-500",    emoji: "🏃", type: 'skill', description: "北园区域代取快递、外卖。风雨无阻，诚信服务。大件物品需额外加价。" },
];

// 扩展状态颜色，支持技能状态
const conditionColors: Record<string, string> = {
  // 物品状态
  "全新":     "bg-green-100 text-green-700",
  "全新未拆": "bg-green-100 text-green-700",
  "九成新":   "bg-blue-100 text-blue-700",
  "八成新":   "bg-yellow-100 text-yellow-700",
  "七成新":   "bg-orange-100 text-orange-700",
  // 技能状态
  "专业":     "bg-purple-100 text-purple-700",
  "接单中":   "bg-blue-100 text-blue-700",
  "加急":     "bg-red-100 text-red-700",
  "周末":     "bg-orange-100 text-orange-700",
  "空闲":     "bg-green-100 text-green-700",
};

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const item = mockItems.find((i) => i.id === id);

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-muted-foreground">
        <span className="text-6xl">🔍</span>
        <p className="text-lg font-medium">商品不存在或已下架</p>
        <Link href="/marketplace">
          <Button variant="outline">返回市场</Button>
        </Link>
      </div>
    );
  }

  // 判断是否为技能类型
  const isSkill = item.type === 'skill';

  return (
    <div className="min-h-screen max-w-2xl mx-auto bg-background pb-20">
      {/* Back button */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-full p-1.5 hover:bg-muted transition-colors text-lg leading-none"
          aria-label="返回"
        >
          ←
        </button>
        <span className="font-semibold text-sm truncate flex-1">{item.title}</span>
        {/* 顶部简单的类型标记 */}
        {isSkill ? (
            <Zap className="w-4 h-4 text-purple-600" />
        ) : (
            <Package className="w-4 h-4 text-blue-600" />
        )}
      </div>

      {/* Product image area */}
      <div className={`w-full aspect-video bg-gradient-to-br ${item.gradient} flex items-center justify-center relative`}>
        <span className="text-8xl drop-shadow-lg transform hover:scale-110 transition-transform duration-300">{item.emoji}</span>
        {/* 类型角标 */}
        <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1 ${
            isSkill ? 'bg-purple-500/90' : 'bg-blue-500/90'
        }`}>
            {isSkill ? <Zap size={12} fill="currentColor" /> : <Package size={12} />}
            {isSkill ? "技能服务" : "闲置物品"}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Title & price */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-bold leading-snug flex-1 text-foreground">{item.title}</h1>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${conditionColors[item.condition] ?? "bg-muted text-muted-foreground"}`}>
              {item.condition}
            </span>
          </div>
          
          <div className="flex items-end gap-2">
            <div className="flex items-baseline">
                <span className="text-3xl font-bold text-primary">
                    {item.price > 0 ? `¥${item.price}` : '免费'}
                </span>
                {isSkill && <span className="text-lg text-muted-foreground ml-0.5">{item.unit}</span>}
            </div>

            {item.originalPrice && (
              <>
                <span className="text-sm text-muted-foreground line-through mb-1 ml-1">
                    {isSkill ? "参考价 " : "原价 "}¥{item.originalPrice}
                </span>
                <span className="text-xs text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded mb-1.5">
                  {isSkill ? '优惠' : '省'} ¥{item.originalPrice - item.price}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Meta info grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: "分类", value: item.category },
            { label: isSkill ? "服务方式" : "交易地点", value: item.location },
            { label: "发布时间", value: item.time },
          ].map(({ label, value }) => (
            <div key={label} className="bg-muted/50 rounded-xl p-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="font-medium text-foreground">{value}</p>
            </div>
          ))}
          <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">{isSkill ? "当前状态" : "成色"}</p>
            <p className="font-medium text-foreground">{item.condition}</p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {isSkill ? "服务详情" : "商品描述"}
          </h2>
          <div className="text-sm leading-relaxed bg-muted/30 rounded-xl p-4 border border-border/50 text-foreground/90 whitespace-pre-wrap">
              {item.description || "暂无详细描述..."}
          </div>
        </div>

        {/* Seller info */}
        <div className="border rounded-2xl p-4 space-y-3 bg-card shadow-sm">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">卖家信息</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-lg font-bold text-primary">
                {item.sellerAvatar || item.seller.charAt(0)}
              </div>
              <div>
                <p className="font-semibold">{item.seller}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center text-amber-500">
                      ⭐ {item.sellerRating || 5.0}
                  </span>
                  <span>·</span>
                  <span>已成交 {item.sellerDeals || 0} 笔</span>
                </div>
              </div>
            </div>
            <Link href="/chat">
              <Button size="sm" variant="outline" className="rounded-xl">查看主页</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky bottom action */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-4 flex gap-3 max-w-2xl mx-auto z-50">
        <button className="flex-1 rounded-xl border bg-background hover:bg-muted transition-colors text-sm font-semibold flex items-center justify-center gap-2">
          <span>❤️</span> 收藏
        </button>
        <Link href="/chat" className="flex-[2]">
          <Button className={`w-full py-6 rounded-xl font-bold text-base shadow-lg ${
              isSkill ? 'bg-purple-600 hover:bg-purple-700' : ''
          }`}>
            💬 {isSkill ? "预约服务" : "联系卖家"}
          </Button>
        </Link>
      </div>
    </div>
  );
}