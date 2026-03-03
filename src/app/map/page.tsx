"use client";

import { useState } from "react";

const tradingSpots = [
  {
    id: 1,
    name: "荔园宿舍楼下",
    shortName: "荔园",
    description: "最热门的交易地点，宿舍区人流量大，适合书籍、生活用品等小物件",
    activeItems: 28,
    tags: ["书籍", "生活用品", "服装"],
    emoji: "🏠",
    color: "bg-blue-50 border-blue-200",
    tagColor: "bg-blue-100 text-blue-700",
    x: 30, y: 60, // map position %
  },
  {
    id: 2,
    name: "图书馆正门",
    shortName: "图书馆",
    description: "安静安全的交易场所，适合书籍、学习用品，学术氛围浓厚",
    activeItems: 15,
    tags: ["书籍教材", "文具"],
    emoji: "📚",
    color: "bg-violet-50 border-violet-200",
    tagColor: "bg-violet-100 text-violet-700",
    x: 50, y: 40,
  },
  {
    id: 3,
    name: "工学院广场",
    shortName: "工学院",
    description: "电子产品热门交易地，光线好便于验货，附近有工科楼群",
    activeItems: 22,
    tags: ["电子产品", "数码"],
    emoji: "💻",
    color: "bg-emerald-50 border-emerald-200",
    tagColor: "bg-emerald-100 text-emerald-700",
    x: 70, y: 35,
  },
  {
    id: 4,
    name: "南园宿舍区",
    shortName: "南园",
    description: "南区主要生活区，适合大型物品如体育器材、家具等",
    activeItems: 19,
    tags: ["运动器材", "生活用品"],
    emoji: "🏃",
    color: "bg-amber-50 border-amber-200",
    tagColor: "bg-amber-100 text-amber-700",
    x: 25, y: 75,
  },
  {
    id: 5,
    name: "北园宿舍区",
    shortName: "北园",
    description: "北区宿舍楼群，交通便利，附近有小卖部可供等待",
    activeItems: 12,
    tags: ["服装", "生活用品"],
    emoji: "🧩",
    color: "bg-rose-50 border-rose-200",
    tagColor: "bg-rose-100 text-rose-700",
    x: 65, y: 70,
  },
  {
    id: 6,
    name: "体育馆门口",
    shortName: "体育馆",
    description: "运动器材、户外装备的专属交易点，就近验货试用",
    activeItems: 8,
    tags: ["运动器材", "服装"],
    emoji: "🏋️",
    color: "bg-orange-50 border-orange-200",
    tagColor: "bg-orange-100 text-orange-700",
    x: 45, y: 80,
  },
];

export default function MapPage() {
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const selected = tradingSpots.find((s) => s.id === selectedSpot);
  const filtered = tradingSpots.filter(
    (s) =>
      !searchQuery ||
      s.name.includes(searchQuery) ||
      s.tags.some((t) => t.includes(searchQuery))
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-background space-y-2">
        <h1 className="font-bold text-lg">校园交易地图</h1>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base leading-none pointer-events-none">🔍</span>
          <input
            type="text"
            placeholder="搜索地点或商品类型..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-muted pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Stylized campus map */}
        <div className="relative mx-4 mt-4 rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border border-green-200 overflow-hidden" style={{ height: 240 }}>
          {/* Map decorative elements */}
          <div className="absolute inset-0">
            {/* Roads */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/80" />
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/80" />
            <div className="absolute left-1/4 top-1/4 w-1/2 h-1/2 rounded-xl border border-white/60 bg-white/20" />
          </div>

          {/* Campus label */}
          <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-bold text-green-800 border border-green-200">
            南方科技大学
          </div>

          {/* Spot markers */}
          {tradingSpots.map((spot) => (
            <button
              key={spot.id}
              onClick={() => setSelectedSpot(spot.id === selectedSpot ? null : spot.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            >
              <div className={`flex flex-col items-center gap-0.5 group`}>
                <div className={`rounded-full text-base leading-none p-2 shadow-md transition-all duration-200 border-2 ${
                  selectedSpot === spot.id
                    ? "scale-125 bg-primary text-primary-foreground border-primary"
                    : "bg-white border-white hover:scale-110"
                }`}>
                  {spot.emoji}
                </div>
                <span className="text-[9px] font-bold bg-white/90 backdrop-blur-sm px-1 rounded shadow-sm whitespace-nowrap">
                  {spot.shortName}
                </span>
              </div>
            </button>
          ))}

          {/* Legend */}
          <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1.5 text-[10px] text-gray-600 border border-green-200">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>已选地点</span>
            </div>
          </div>
        </div>

        {/* Selected spot detail */}
        {selected && (
          <div className={`mx-4 mt-3 rounded-2xl border p-4 ${selected.color}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selected.emoji}</span>
                <div>
                  <h3 className="font-bold">{selected.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{selected.activeItems} 件商品在售</p>
                </div>
              </div>
              <button onClick={() => setSelectedSpot(null)} className="text-muted-foreground text-lg">×</button>
            </div>
            <p className="text-sm mt-2 text-muted-foreground leading-relaxed">{selected.description}</p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {selected.tags.map((tag) => (
                <span key={tag} className={`rounded-full px-2 py-0.5 text-xs font-medium ${selected.tagColor}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Spots list */}
        <div className="px-4 pt-4 pb-4">
          <h2 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">
            热门交易地点 · {filtered.length} 个
          </h2>
          <div className="space-y-2">
            {filtered.map((spot) => (
              <button
                key={spot.id}
                onClick={() => setSelectedSpot(spot.id === selectedSpot ? null : spot.id)}
                className={`w-full text-left rounded-2xl border p-3.5 transition-all duration-200 hover:shadow-md ${
                  selectedSpot === spot.id ? spot.color + " shadow-md" : "bg-card hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl shrink-0">{spot.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{spot.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {spot.activeItems} 件在售
                      </span>
                    </div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {spot.tags.map((tag) => (
                        <span key={tag} className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${spot.tagColor}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <span className="text-5xl">🗺️</span>
              <p className="text-sm">没有找到匹配的地点</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
