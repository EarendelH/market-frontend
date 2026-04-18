"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BuyerOrderConfirmationModal,
  type BuyerOrderConfirmation,
} from "@/components/orders/buyer-order-confirmation-modal";

const mockItems = [
  { id: "1",  title: "高等数学教材（第七版）",     price: 25,   originalPrice: 45,   condition: "九成新",   seller: "张同学", sellerAvatar: "张", sellerRating: 4.9, sellerDeals: 12, time: "2026-02-28", category: "书籍教材", location: "荔园宿舍",   gradient: "from-blue-400 to-blue-600",     emoji: "📚", description: "同济版高数上下册，笔记不多，内容清晰。考完研不再需要，价格实惠。自提或可约图书馆门口交易。" },
  { id: "2",  title: "AirPods Pro 二代",           price: 1200, originalPrice: 1999, condition: "八成新",   seller: "李同学", sellerAvatar: "李", sellerRating: 5.0, sellerDeals: 8,  time: "2026-02-25", category: "电子产品", location: "工学院广场", gradient: "from-slate-400 to-slate-600",   emoji: "🎧", description: "Apple AirPods Pro 第二代，含原装充电盒及数据线。电池健康度92%，降噪效果依旧出色。仅因换了其他耳机出售。" },
  { id: "3",  title: "宿舍护眼台灯",               price: 35,   originalPrice: 89,   condition: "全新未拆", seller: "王同学", sellerAvatar: "王", sellerRating: 4.8, sellerDeals: 5,  time: "2026-02-24", category: "生活用品", location: "南园宿舍",   gradient: "from-amber-400 to-orange-500",  emoji: "💡", description: "小米全光谱护眼台灯，全新未拆封，收到礼物但已有同款。支持多档调光，USB充电。" },
  { id: "4",  title: "Nike跑鞋 42码",              price: 180,  originalPrice: 560,  condition: "七成新",   seller: "陈同学", sellerAvatar: "陈", sellerRating: 4.7, sellerDeals: 3,  time: "2026-02-23", category: "服装",     location: "体育馆附近", gradient: "from-red-400 to-rose-600",      emoji: "👟", description: "Nike Air Zoom Pegasus 40，42码，黑白配色。日常训练用，鞋面干净，鞋底磨损正常。因脚型不合出售。" },
  { id: "5",  title: "机械键盘（青轴）",           price: 220,  originalPrice: 380,  condition: "九成新",   seller: "刘同学", sellerAvatar: "刘", sellerRating: 4.9, sellerDeals: 20, time: "2026-02-22", category: "电子产品", location: "理学院",     gradient: "from-emerald-400 to-green-600", emoji: "⌨️", description: "IKBC C87机械键盘，87键布局，青轴，PBT双色键帽，打字手感极佳。附赠原装键帽拔键器。" },
  { id: "6",  title: "算法导论（英文第3版）",      price: 60,   originalPrice: 128,  condition: "八成新",   seller: "赵同学", sellerAvatar: "赵", sellerRating: 4.6, sellerDeals: 7,  time: "2026-02-20", category: "书籍教材", location: "图书馆",     gradient: "from-violet-400 to-purple-600", emoji: "📖", description: "CLRS算法导论英文第三版，CS必读经典。书内有少量铅笔标注，可擦除。毕业不带走出售。" },
  { id: "7",  title: "瑜伽垫（全新未拆封）",       price: 45,   originalPrice: 88,   condition: "全新",     seller: "孙同学", sellerAvatar: "孙", sellerRating: 5.0, sellerDeals: 2,  time: "2026-02-19", category: "运动器材", location: "南园宿舍",   gradient: "from-teal-400 to-cyan-600",     emoji: "🧘", description: "Lululemon瑜伽垫，6mm厚度，防滑效果好，全新未拆封。本想健身结果没坚持下去。" },
  { id: "8",  title: "iPad mini 6 WiFi 256G",      price: 2800, originalPrice: 3799, condition: "九成新",   seller: "周同学", sellerAvatar: "周", sellerRating: 4.8, sellerDeals: 15, time: "2026-02-18", category: "电子产品", location: "工学院",     gradient: "from-zinc-400 to-gray-600",     emoji: "📱", description: "iPad mini 6 WiFi版256GB，深空灰，电池健康95%。附原装充电器及Apple Pencil二代接口支持。因换iPad Pro出售。" },
  { id: "9",  title: "线性代数（同济第六版）",     price: 15,   originalPrice: 32,   condition: "八成新",   seller: "吴同学", sellerAvatar: "吴", sellerRating: 4.5, sellerDeals: 4,  time: "2026-02-17", category: "书籍教材", location: "荔园",       gradient: "from-indigo-400 to-blue-600",   emoji: "📐", description: "同济大学线性代数第六版，全国通用教材，内有部分笔记，考试复习利器。" },
  { id: "10", title: "电动牙刷（Oral-B）",         price: 80,   originalPrice: 199,  condition: "九成新",   seller: "郑同学", sellerAvatar: "郑", sellerRating: 4.7, sellerDeals: 6,  time: "2026-02-15", category: "生活用品", location: "北园",       gradient: "from-sky-400 to-blue-500",      emoji: "🪥", description: "Oral-B电动牙刷，已更换新刷头，充电底座完好。日常使用半年，清洁效果依旧出色。" },
  { id: "11", title: "哑铃一对 5kg×2",             price: 55,   originalPrice: 120,  condition: "九成新",   seller: "钱同学", sellerAvatar: "钱", sellerRating: 4.9, sellerDeals: 9,  time: "2026-02-14", category: "运动器材", location: "体育馆",     gradient: "from-stone-400 to-stone-600",   emoji: "🏋️", description: "铸铁包胶哑铃，5kg×2，共10kg。表面无掉漆，适合日常健身训练。因宿舍空间有限出售。" },
  { id: "12", title: "优衣库羽绒服 M码",           price: 120,  originalPrice: 399,  condition: "九成新",   seller: "冯同学", sellerAvatar: "冯", sellerRating: 4.8, sellerDeals: 11, time: "2026-02-10", category: "服装",     location: "北园",       gradient: "from-blue-300 to-indigo-400",   emoji: "🧥", description: "优衣库轻型羽绒服，M码，藏青色。保暖性好，干洗一次，成色新。因体重变化M码偏小出售。" },
];

const conditionColors: Record<string, string> = {
  "全新":     "bg-green-100 text-green-700",
  "全新未拆": "bg-green-100 text-green-700",
  "九成新":   "bg-blue-100 text-blue-700",
  "八成新":   "bg-yellow-100 text-yellow-700",
  "七成新":   "bg-orange-100 text-orange-700",
};

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const item = mockItems.find((i) => i.id === id);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [buyerSelection, setBuyerSelection] = useState<BuyerOrderConfirmation | null>(null);

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

  return (
    <div className="min-h-screen max-w-2xl mx-auto">
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
      </div>

      {/* Product image */}
      <div className={`w-full aspect-video bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
        <span className="text-8xl drop-shadow-lg">{item.emoji}</span>
      </div>

      <div className="p-4 space-y-5">
        {/* Title & price */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold leading-snug flex-1">{item.title}</h1>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${conditionColors[item.condition] ?? "bg-muted text-muted-foreground"}`}>
              {item.condition}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">¥{item.price}</span>
            <span className="text-base text-muted-foreground line-through">原价 ¥{item.originalPrice}</span>
            <span className="text-xs text-green-600 font-medium">
              省 ¥{item.originalPrice - item.price}
            </span>
          </div>
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            { label: "分类", value: item.category },
            { label: "交易地点", value: item.location },
            { label: "发布时间", value: item.time },
          ].map(({ label, value }) => (
            <div key={label} className="bg-muted rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
              <p className="font-medium">{value}</p>
            </div>
          ))}
          <div className="bg-muted rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-0.5">成色</p>
            <p className="font-medium">{item.condition}</p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">商品描述</h2>
          <p className="text-sm leading-relaxed bg-muted rounded-xl p-4">{item.description}</p>
        </div>

        {/* Seller info */}
        <div className="border rounded-2xl p-4 space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">卖家信息</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-lg font-bold">
                {item.sellerAvatar}
              </div>
              <div>
                <p className="font-semibold">{item.seller}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span>⭐ {item.sellerRating}</span>
                  <span>·</span>
                  <span>已成交 {item.sellerDeals} 笔</span>
                </div>
              </div>
            </div>
            <Link href="/chat">
              <Button size="sm" variant="outline">查看主页</Button>
            </Link>
          </div>
        </div>

        {buyerSelection && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-emerald-900">买家确认信息已填写</p>
                <p className="text-xs text-emerald-700">待卖家确认后即可进入线下交易流程</p>
              </div>
              <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white">
                待确认
              </span>
            </div>
            <div className="space-y-1 text-sm text-emerald-900">
              <p>
                <span className="text-emerald-700">交易时间：</span>
                {buyerSelection.meetingDate} · {buyerSelection.timeSlot}
              </p>
              <p>
                <span className="text-emerald-700">交易地点：</span>
                {buyerSelection.location}
                {buyerSelection.locationDetail ? `（${buyerSelection.locationDetail}）` : ""}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom action */}
      <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4 flex gap-3">
        <button className="rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-muted transition-colors">
          ❤️ 收藏
        </button>
        <Link href="/chat" className="flex-1">
          <Button variant="outline" className="w-full py-3 rounded-xl font-semibold text-sm">
            💬 联系卖家
          </Button>
        </Link>
        <Button
          className="flex-1 py-3 rounded-xl font-semibold text-sm"
          onClick={() => setConfirmModalOpen(true)}
        >
          {buyerSelection ? "修改确认信息" : "确认下单"}
        </Button>
      </div>

      <BuyerOrderConfirmationModal
        itemTitle={item.title}
        sellerName={item.seller}
        price={item.price}
        itemLocation={item.location}
        open={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
        onConfirm={setBuyerSelection}
      />
    </div>
  );
}
