"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const mockUser = {
  name: "南科小卖家",
  username: "@sustech_2024",
  avatar: "南",
  college: "工学院",
  joinDate: "2024 年 9 月",
  bio: "SUSTech 大三学生，喜欢淘便宜好物，东西多到放不下 😂",
  stats: { published: 8, sold: 15, rating: 4.9, followers: 32 },
};

const myItems = [
  { id: "5",  title: "机械键盘（青轴）",      price: 220, condition: "九成新", gradient: "from-emerald-400 to-green-600",  emoji: "⌨️", status: "在售" },
  { id: "11", title: "哑铃一对 5kg×2",        price: 55,  condition: "九成新", gradient: "from-stone-400 to-stone-600",    emoji: "🏋️", status: "在售" },
  { id: "2",  title: "AirPods Pro 二代",      price: 1200,condition: "八成新", gradient: "from-slate-400 to-slate-600",   emoji: "🎧", status: "已售" },
  { id: "9",  title: "线性代数（同济第六版）", price: 15,  condition: "八成新", gradient: "from-indigo-400 to-blue-600",   emoji: "📐", status: "已售" },
];

const favorites = [
  { id: "1",  title: "高等数学教材（第七版）", price: 25,  gradient: "from-blue-400 to-blue-600",    emoji: "📚" },
  { id: "8",  title: "iPad mini 6 WiFi 256G", price: 2800, gradient: "from-zinc-400 to-gray-600",    emoji: "📱" },
  { id: "7",  title: "瑜伽垫（全新未拆封）",  price: 45,  gradient: "from-teal-400 to-cyan-600",    emoji: "🧘" },
];

const tabs = ["我的发布", "已购商品", "收藏"];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("我的发布");
  const [editing, setEditing] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const displayUser = {
    name: user?.username ?? mockUser.name,
    username: user ? `@${user.username}` : mockUser.username,
    avatar: user?.username?.slice(0, 1) ?? mockUser.avatar,
    college: mockUser.college,
    joinDate: mockUser.joinDate,
    bio: user?.bio ?? mockUser.bio,
    stats: mockUser.stats,
  };

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen">
      {/* Profile header */}
      <div className="bg-gradient-to-b from-primary/10 to-background px-4 pt-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg">
              {displayUser.avatar}
            </div>
            <div>
              <h1 className="text-xl font-bold">{displayUser.name}</h1>
              <p className="text-sm text-muted-foreground">{displayUser.username}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">
                  {displayUser.college}
                </span>
                <span className="text-xs text-muted-foreground">加入于 {displayUser.joinDate}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="shrink-0 rounded-xl border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            编辑
          </button>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground leading-relaxed">{displayUser.bio}</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: "已发布", value: displayUser.stats.published },
            { label: "已成交", value: displayUser.stats.sold },
            { label: "信用评分", value: displayUser.stats.rating },
            { label: "关注者", value: displayUser.stats.followers },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card rounded-xl p-3 text-center border">
              <p className="text-xl font-bold">{value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b px-4 flex gap-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {activeTab === "我的发布" && (
          <div className="space-y-3">
            {myItems.map((item) => (
              <Link key={item.id} href={`/marketplace/${item.id}`}>
                <div className="flex items-center gap-3 bg-card border rounded-2xl p-3 hover:shadow-md transition-all duration-200">
                  <div className={`h-14 w-14 shrink-0 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl`}>
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.condition}</p>
                    <p className="font-bold mt-1">¥{item.price}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    item.status === "在售"
                      ? "bg-green-100 text-green-700"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {item.status}
                  </span>
                </div>
              </Link>
            ))}
            <button className="w-full rounded-2xl border-2 border-dashed py-6 text-sm text-muted-foreground hover:bg-muted/50 transition-colors flex flex-col items-center gap-2">
              <span className="text-2xl">＋</span>
              发布新商品
            </button>
          </div>
        )}

        {activeTab === "已购商品" && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <span className="text-5xl">🛍️</span>
            <p className="font-medium">暂无购买记录</p>
            <p className="text-sm">去市场看看心仪的好物？</p>
            <Link href="/marketplace">
              <button className="mt-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition">
                逛逛市场
              </button>
            </Link>
          </div>
        )}

        {activeTab === "收藏" && (
          <div className="grid grid-cols-2 gap-3">
            {favorites.map((item) => (
              <Link key={item.id} href={`/marketplace/${item.id}`}>
                <article className="bg-card rounded-2xl overflow-hidden border hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                  <div className={`aspect-square bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                    <span className="text-4xl">{item.emoji}</span>
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-sm font-medium line-clamp-2 leading-snug">{item.title}</p>
                    <span className="font-bold text-base">¥{item.price}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Settings section */}
      <div className="px-4 pb-8 mt-4">
        <div className="border rounded-2xl overflow-hidden divide-y">
          {[
            { icon: "🔔", label: "通知设置" },
            { icon: "🔒", label: "账号安全" },
            { icon: "🎨", label: "外观设置" },
          ].map(({ icon, label }) => (
            <button
              key={label}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
            >
              <span className="flex items-center gap-3 text-sm font-medium">
                <span>{icon}</span>
                {label}
              </span>
              <span className="text-muted-foreground text-sm">›</span>
            </button>
          ))}
          <Link
            href="/report"
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <span>🚩</span>
              举报与反馈
            </span>
            <span className="text-muted-foreground text-sm">›</span>
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-4 rounded-2xl border border-red-200 py-3.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
