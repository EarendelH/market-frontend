"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Package, MapPin, Clock, X, Edit, Trash2, Heart } from "lucide-react";
import { reputationToFiveScale } from "@/lib/reputation";

export default function ItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({ price: "", note: "" });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ price: "", description: "", location_text: "" });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: item, isLoading: isItemLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: () => apiClient.get<any>(`/items/${id}`),
  });

  const { data: seller, isLoading: isSellerLoading } = useQuery({
    queryKey: ["user", item?.owner_id],
    queryFn: () => apiClient.get<any>(`/users/${item?.owner_id}`),
    enabled: !!item?.owner_id,
  });

  const chatMutation = useMutation({
    mutationFn: () => apiClient.post<{ id: number }>("/conversations", {
      item_id: item?.id,
      seller_id: item?.owner_id,
    }),
    onSuccess: (data) => {
      toast.success("已创建聊天会话");
      router.push(`/chat?conversationId=${data.id}`);
    },
    onError: (err: any) => toast.error(err.message || "无法发起聊天"),
  });

  const orderMutation = useMutation({
    mutationFn: (payload: { item_id: number; price: number; note: string }) => 
      apiClient.post<{ id: number }>("/orders", payload),
    onSuccess: (data) => {
      toast.success("下单成功！");
      setIsOrderModalOpen(false);
      router.push(`/orders/${data.id}`);
    },
    onError: (err: any) => toast.error(err.message || "下单失败"),
  });

  const updateItemMutation = useMutation({
    mutationFn: (payload: any) => apiClient.patch(`/items/${item?.id}`, payload),
    onSuccess: () => {
      toast.success("商品信息已更新");
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["item", id] });
    },
    onError: (err: any) => toast.error(err.message || "更新失败"),
  });

  const deleteItemMutation = useMutation({
    mutationFn: () => apiClient.delete(`/items/${item?.id}`),
    onSuccess: () => {
      toast.success("商品已删除");
      router.replace("/marketplace");
    },
    onError: (err: any) => toast.error(err.message || "删除失败"),
  });

  const delistMutation = useMutation({
    mutationFn: () => apiClient.patch(`/items/${item?.id}`, { status: item?.status === "active" ? "inactive" : "active" }),
    onSuccess: () => {
      toast.success(item?.status === "active" ? "商品已下架" : "商品已重新上架");
      queryClient.invalidateQueries({ queryKey: ["item", id] });
    },
    onError: (err: { message?: string }) => toast.error(err.message || "操作失败"),
  });

  const wishlistMutation = useMutation({
    mutationFn: () =>
      apiClient.post("/wishlists", {
        keyword: item?.title ?? "",
        type: item?.type === "skill" ? "skill" : "item",
        max_price: Math.max(Number(item?.price) || 0, 1),
      }),
    onSuccess: () => {
      toast.success("已加入心愿单");
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
    onError: (err: { message?: string }) => toast.error(err.message || "添加失败"),
  });

  const handleOpenOrderModal = () => {
    setOrderForm({ price: item.price.toString(), note: "" });
    setIsOrderModalOpen(true);
  };

  const submitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.price || isNaN(Number(orderForm.price))) return toast.error("请输入有效价格");
    orderMutation.mutate({
      item_id: item.id,
      price: Number(orderForm.price),
      note: orderForm.note.trim()
    });
  };

  const handleOpenEditModal = () => {
    setEditForm({ 
      price: item.price.toString(), 
      description: item.description || "", 
      location_text: item.location_text || "" 
    });
    setIsEditModalOpen(true);
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateItemMutation.mutate({
      price: Number(editForm.price),
      description: editForm.description,
      location_text: editForm.location_text
    });
  };

  const handleDelete = () => {
    if (confirm("确定要永久删除这个商品吗？该操作不可恢复。")) {
      deleteItemMutation.mutate();
    }
  };

  if (isItemLoading) return <div className="p-10 text-center">加载商品信息中...</div>;
  if (!item) return <div className="p-10 text-center">商品不存在或已删除</div>;

  const isSkill = item.type === "skill";
  const isLost = item.type === "lost";
  const isOwner = Number(currentUser?.id) === Number(item.owner_id);

  return (
    <div className="min-h-screen max-w-2xl mx-auto bg-background pb-24 relative">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-full p-1.5 hover:bg-muted text-lg leading-none">←</button>
        <span className="font-semibold text-sm truncate flex-1">
          {isSkill ? "技能服务详情" : isLost ? "失物招领详情" : item.type === "errand" ? "跑腿服务详情" : "闲置物品详情"}
        </span>
      </div>

      <div className="w-full aspect-square md:aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
        {item.cover_images?.length > 0 ? (
          <>
            <img src={item.cover_images[currentImageIndex]} alt={item.title} className="w-full h-full object-cover" />
            {item.cover_images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentImageIndex((i: number) => (i - 1 + item.cover_images.length) % item.cover_images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/60"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentImageIndex((i: number) => (i + 1) % item.cover_images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/60"
                >
                  ›
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {item.cover_images.map((_: string, i: number) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? "bg-white scale-125" : "bg-white/50"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-muted-foreground opacity-50 flex flex-col items-center"><Package size={48} /></div>
        )}
        {item.status !== 'active' && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
             <span className="px-6 py-2 bg-black/80 text-white font-bold rounded-full text-lg tracking-widest rotate-[-15deg]">
               已{item.status === 'sold' ? '售出' : '下架'}
             </span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-6">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold leading-snug">{item.title}</h1>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-primary">¥{item.price}</span>
            <span className="text-sm text-muted-foreground mb-1">({item.price_mode === 'negotiable' ? '可小刀' : '一口价'})</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-muted/50 rounded-xl p-3 border flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">交易地点</p>
              <p className="font-medium">{item.location_text || "未填写"}</p>
            </div>
          </div>
          <div className="bg-muted/50 rounded-xl p-3 border flex items-start gap-2">
            <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">发布时间</p>
              <p className="font-medium">{new Date(item.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase">详细描述</h2>
          <div className="text-sm leading-relaxed bg-muted/30 rounded-xl p-4 border whitespace-pre-wrap">
            {item.description || "卖家没有留下详细描述。"}
          </div>
        </div>

        <div className="border rounded-2xl p-4 space-y-3 bg-card shadow-sm">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase">卖家信息</h2>
          {isSellerLoading ? <div className="animate-pulse h-12 bg-muted rounded-xl" /> : seller && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary overflow-hidden">
                  {seller.avatar_url ? <img src={seller.avatar_url} className="w-full h-full object-cover" /> : seller.username.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{seller.username}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    信誉 {reputationToFiveScale(isSkill ? seller.reputation_skill : seller.reputation_trade)} · 成交{" "}
                    {isSkill ? seller.skill_count ?? 0 : seller.trade_count ?? 0} 次
                  </p>
                </div>
              </div>
              <Link href={`/profile/${seller.id}`}>
                <Button size="sm" variant="outline" className="rounded-xl h-8">查看主页</Button>
              </Link>
            </div>
          )}
        </div>

        {!isOwner && currentUser && item.status === "active" && (
          <Button
            type="button"
            variant="secondary"
            className="w-full rounded-xl h-11 gap-2"
            onClick={() => wishlistMutation.mutate()}
            disabled={wishlistMutation.isPending}
          >
            <Heart className="w-4 h-4" /> 加入心愿单（匹配推送）
          </Button>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-4 flex gap-3 max-w-2xl mx-auto z-40">
        {isOwner ? (
          <>
            <Button variant="outline" className="rounded-xl h-12 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDelete} disabled={deleteItemMutation.isPending}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => delistMutation.mutate()} disabled={delistMutation.isPending}>
              {item.status === "active" ? "下架" : "重新上架"}
            </Button>
            <Button className="flex-1 rounded-xl h-12" onClick={handleOpenEditModal}>
              <Edit className="w-4 h-4 mr-2" /> 修改
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => chatMutation.mutate()} disabled={chatMutation.isPending || item.status !== 'active' || !currentUser}>
              💬 {isLost ? "联系发布者" : "联系卖家"}
            </Button>
            <Button className="flex-[2] rounded-xl font-bold h-12" onClick={handleOpenOrderModal} disabled={item.status !== 'active' || !currentUser || isLost}>
              {!currentUser ? "登录后下单" : item.status !== 'active' ? "商品不可售" : isLost ? "失物无需下单" : "发起订单"}
            </Button>
          </>
        )}
      </div>

      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background w-full max-w-md rounded-3xl p-6 shadow-xl animate-in slide-in-from-bottom-10 sm:zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">确认下单信息</h2>
              <button onClick={() => setIsOrderModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={submitOrder} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">协商价格 (元)</label>
                <input type="number" value={orderForm.price} onChange={e => setOrderForm({...orderForm, price: e.target.value})} className="w-full rounded-xl border bg-muted/50 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" />
                <p className="text-xs text-muted-foreground">如果已与卖家商议好价格，请在此修改。</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">给卖家的留言 (选填)</label>
                <textarea value={orderForm.note} onChange={e => setOrderForm({...orderForm, note: e.target.value})} rows={3} placeholder="例如：明天中午荔园二食堂当面交易" className="w-full rounded-xl border bg-muted/50 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl font-bold mt-2" disabled={orderMutation.isPending}>
                {orderMutation.isPending ? "提交中..." : "确认生成订单"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background w-full max-w-md rounded-3xl p-6 shadow-xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">修改商品信息</h2>
              <button onClick={() => setIsEditModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={submitEdit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">价格 (元)</label>
                <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-full rounded-xl border px-4 py-3 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">交易地点</label>
                <input type="text" value={editForm.location_text} onChange={e => setEditForm({...editForm, location_text: e.target.value})} className="w-full rounded-xl border px-4 py-3 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">商品描述</label>
                <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={4} className="w-full rounded-xl border px-4 py-3 outline-none resize-none" />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl font-bold" disabled={updateItemMutation.isPending}>
                {updateItemMutation.isPending ? "保存中..." : "保存修改"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}