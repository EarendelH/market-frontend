"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Star, CheckCircle2, Package, MessageCircle, ChevronLeft } from "lucide-react";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = typeof params.id === "string" || typeof params.id === "number" ? params.id : "";
  

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => apiClient.get<any>(`/users/${userId}`),
  });

  const { data: itemsData, isLoading: isItemsLoading } = useQuery({
    queryKey: ["items", "user", userId],
    queryFn: () => apiClient.get<any>("/items", { params: { owner_id: userId } }),
    enabled: !!userId,
  });

  if (isUserLoading) return <div className="p-10 text-center text-muted-foreground">正在加载主页信息...</div>;
  if (!user) return <div className="p-10 text-center text-muted-foreground">该用户不存在或已被注销</div>;

  const items = itemsData?.items || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-muted rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <span className="font-bold">用户主页</span>
      </div>

      <div className="p-4 bg-gradient-to-b from-muted/50 to-transparent">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary shadow-inner border-4 border-background overflow-hidden">
            {user.avatar_url ? (
               <img src={user.avatar_url} className="w-full h-full object-cover" /> 
            ) : (
               user.username.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-[250px] mx-auto leading-relaxed">
              {user.bio || "这位同学很低调，什么也没有留下。"}
            </p>
          </div>

          <div className="flex gap-6 w-full justify-center py-2">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 text-amber-600 font-bold text-lg">
                <Star size={16} className="fill-amber-500" /> {user.reputation_trade}
              </div>
              <span className="text-[10px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">交易信誉</span>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 text-blue-600 font-bold text-lg">
                <CheckCircle2 size={16} className="fill-blue-500 text-white" /> {user.reputation_skill}
              </div>
              <span className="text-[10px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">技能信誉</span>
            </div>
          </div>
          
        </div>
      </div>

      <div className="px-4 mt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            Ta 发布的 <span className="text-muted-foreground font-normal text-sm bg-muted px-2 py-0.5 rounded-full">{items.length}</span>
          </h2>
        </div>

        {isItemsLoading ? (
          <div className="grid grid-cols-2 gap-3 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/5] bg-muted rounded-2xl" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-3 text-muted-foreground opacity-50">
            <Package size={48} />
            <p className="text-sm">该用户还没有发布过任何闲置或技能</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item: any) => (
              <Link key={item.id} href={`/marketplace/${item.id}`}>
                <article className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                  <div className="aspect-square bg-muted relative">
                    {item.cover_images?.[0] ? (
                      <img src={item.cover_images[0]} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package size={32} className="text-muted-foreground/30" /></div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col justify-between flex-1">
                    <h3 className="text-xs font-medium line-clamp-2 min-h-[2rem]">{item.title}</h3>
                    <div className="flex items-baseline gap-0.5 text-primary font-bold mt-2">
                      <span className="text-[10px]">¥</span>
                      <span className="text-base">{item.price}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}