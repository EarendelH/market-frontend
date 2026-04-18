"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQueries, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { reputationToFiveScale } from "@/lib/reputation";
import {
  BookOpen,
  GraduationCap,
  MapPin,
  Package,
  Plus,
  Search,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ItemRow {
  id: number;
  type: string;
  title: string;
  price: number;
  location_text?: string;
  created_at: string;
  cover_images: string[];
  owner_id: number;
  category_id?: number;
  status?: string;
}

interface PublicUser {
  id: number;
  username: string;
  reputation_trade?: number;
  reputation_skill?: number;
  avatar_url?: string | null;
}

const GUEST_DIALOG_KEY = "sustech_market_guest_prompt_v1";

const categoryCards = [
  {
    key: "textbook" as const,
    label: "二手教材",
    sub: "教材 / 教辅",
    icon: BookOpen,
    className: "border-blue-200 bg-blue-50/80 hover:bg-blue-50",
  },
  {
    key: "lost" as const,
    label: "失物招领",
    sub: "校园卡 · 物品",
    icon: ShieldAlert,
    className: "border-amber-200 bg-amber-50/80 hover:bg-amber-50",
  },
  {
    key: "skill" as const,
    label: "技能交换",
    sub: "辅导 · 才艺",
    icon: GraduationCap,
    className: "border-violet-200 bg-violet-50/80 hover:bg-violet-50",
  },
  {
    key: "errand" as const,
    label: "跑腿 / 代取",
    sub: "快递 · 代办",
    icon: Truck,
    className: "border-emerald-200 bg-emerald-50/80 hover:bg-emerald-50",
  },
];

function typeLabel(type: string) {
  switch (type) {
    case "skill":
      return "技能";
    case "lost":
      return "失物";
    case "errand":
      return "跑腿";
    default:
      return "闲置";
  }
}

function priceLabel(item: ItemRow) {
  if (item.type === "skill") return `¥${item.price} · 可协商`;
  if (item.type === "lost") return "认领联系";
  if (item.type === "errand") return `¥${item.price} 起`;
  return `¥${item.price}`;
}

export default function MarketplacePage() {
  const { user, isAuthenticated, isHydrating } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<(typeof categoryCards)[number]["key"] | "all">("all");
  const [guestOpen, setGuestOpen] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || isHydrating) return;
    if (isAuthenticated) return;
    if (sessionStorage.getItem(GUEST_DIALOG_KEY)) return;
    setGuestOpen(true);
  }, [isAuthenticated, isHydrating]);

  const dismissGuest = () => {
    sessionStorage.setItem(GUEST_DIALOG_KEY, "1");
    setGuestOpen(false);
  };

  const apiParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch.trim()) params.keyword = debouncedSearch.trim();
    if (category === "skill") params.type = "skill";
    else if (category === "lost") params.type = "lost";
    else if (category === "errand") params.type = "errand";
    else if (category === "textbook") {
      params.type = "item";
      params.category_id = "1";
    }
    return params;
  }, [debouncedSearch, category]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["items", "feed", apiParams],
    queryFn: () => apiClient.get<{ items: ItemRow[] }>("/items", {
      params: {
        ...apiParams,
        status: "active"  // Bug #2 修复：只获取在售商品
      }
    }),
  });

  const items = data?.items ?? [];

  const ownerIds = useMemo(() => [...new Set(items.map((i) => i.owner_id))], [items]);

  const sellerQueries = useQueries({
    queries: ownerIds.map((id) => ({
      queryKey: ["users", "public", id],
      queryFn: () => apiClient.get<PublicUser>(`/users/${id}`),
      enabled: ownerIds.length > 0,
      staleTime: 60_000,
    })),
  });

  const sellerMap = useMemo(() => {
    const m = new Map<number, PublicUser>();
    ownerIds.forEach((id, idx) => {
      const u = sellerQueries[idx]?.data;
      if (u) m.set(id, u);
    });
    return m;
  }, [ownerIds, sellerQueries]);

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations", "count"],
    queryFn: () => apiClient.get<{ id: number; last_message?: string | null }[]>("/conversations"),
    enabled: isAuthenticated && !isHydrating,
    staleTime: 30_000,
  });

  const msgCount = conversations.filter((c) => c.last_message).length;

  const tradeRep = user ? reputationToFiveScale(user.reputation_trade) : "—";

  return (
    <div className="min-h-screen bg-background pb-24 relative">
      <Dialog open={guestOpen} onOpenChange={(o) => !o && dismissGuest()}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>欢迎来到 SUSTech Market</DialogTitle>
            <DialogDescription>
              未登录可以浏览公开商品信息。发布商品、下单、聊天与心愿单匹配等功能需要登录南科大账号。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={dismissGuest}>
              先逛逛
            </Button>
            <Button asChild className="rounded-xl">
              <Link href="/login">登录 / 注册</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 顶栏：登录态展示信誉与消息 */}
      <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur-sm px-4 py-3 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
              市
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">校园市集</p>
              <p className="text-[10px] text-muted-foreground truncate">南科大 · 闲置 · 技能 · 失物</p>
            </div>
          </div>

          {isHydrating ? (
            <div className="h-9 w-24 rounded-xl bg-muted animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-semibold max-w-[7rem] truncate">{user.username}</span>
                <span className="text-[10px] text-muted-foreground">
                  信誉 <span className="text-amber-600 font-semibold">{tradeRep}</span>
                </span>
              </div>
              <Link
                href="/profile"
                className="h-9 w-9 rounded-full bg-muted border overflow-hidden flex items-center justify-center text-sm font-bold"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </Link>
              <Link
                href="/chat"
                className="relative rounded-xl border px-2.5 py-1.5 text-xs font-semibold hover:bg-muted"
              >
                消息
                {msgCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center px-0.5">
                    {msgCount > 99 ? "99+" : msgCount}
                  </span>
                )}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/login" className="text-xs font-semibold px-3 py-1.5 rounded-xl border hover:bg-muted">
                登录
              </Link>
              <Link
                href="/register"
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-primary text-primary-foreground"
              >
                注册
              </Link>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="关键词 / 书名 / 物品…"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-xl bg-muted pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Link
            href={isAuthenticated ? "/publish" : "/login?redirect=/publish"}
            className="shrink-0 rounded-xl bg-primary px-3 sm:px-4 py-2 text-sm font-semibold text-primary-foreground flex items-center gap-1 shadow-sm"
          >
            <Plus size={18} /> <span className="hidden sm:inline">发布</span>
          </Link>
        </div>
      </div>

      {/* 分类入口 */}
      <div className="px-4 pt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={`rounded-2xl border p-3 text-left transition-all ${
            category === "all" ? "ring-2 ring-primary border-primary bg-primary/5" : "bg-card hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold">全部</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">浏览全部信息流</p>
        </button>
        {categoryCards.map((c) => {
          const Icon = c.icon;
          const active = category === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={`rounded-2xl border p-3 text-left transition-all ${c.className} ${
                active ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <span className="text-sm font-bold">{c.label}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{c.sub}</p>
            </button>
          );
        })}
      </div>

      <div className="p-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {isLoading ? (
          <p className="col-span-full text-center text-muted-foreground py-10">加载中...</p>
        ) : isError ? (
          <p className="col-span-full text-center text-red-500 py-10">
            无法连接后端，请确认 Flask 已在 <code className="text-xs">localhost:5001</code> 运行并已启动前端。
          </p>
        ) : items.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground py-10">暂无符合条件的商品</p>
        ) : (
          items.map((item: ItemRow) => {
            const seller = sellerMap.get(item.owner_id);
            const rep = seller
              ? reputationToFiveScale(item.type === "skill" ? seller.reputation_skill : seller.reputation_trade)
              : "—";
            return (
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
                    <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold border">
                      {typeLabel(item.type)}
                    </span>
                  </div>
                  <div className="p-3 flex flex-col flex-1 justify-between gap-2">
                    <h3 className="text-sm font-medium line-clamp-2 leading-snug">{item.title}</h3>
                    <div className="space-y-1 text-[11px] text-muted-foreground">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-base font-bold text-primary">{priceLabel(item)}</span>
                      </div>
                      {item.location_text && (
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{item.location_text}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-1">
                        <span>{new Date(item.created_at).toLocaleString()}</span>
                        <span className="shrink-0">
                          信誉 <span className="font-semibold text-foreground">{rep}</span>
                        </span>
                      </div>
                      {seller && (
                        <div className="flex items-center gap-1 truncate pt-0.5 border-t border-dashed">
                          <ShoppingBag className="h-3 w-3 shrink-0" />
                          <span className="truncate">{seller.username}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
