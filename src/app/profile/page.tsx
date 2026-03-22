"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import {
  CheckCircle2,
  Star,
  Settings,
  LogOut,
  Package,
  Heart,
  FileText,
  Edit,
  X,
  Camera,
  MessageCircle,
  Bookmark,
  Upload,
} from "lucide-react";
import { reputationToFiveScale } from "@/lib/reputation";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout, isAuthenticated, isHydrating } = useAuthStore();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editForm, setEditForm] = useState({ avatar_url: "", bio: "" });
  const [settingsForm, setSettingsForm] = useState({ username: "", current_password: "", new_password: "" });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // 2. 获取个人数据
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["users", "me"],
    queryFn: () => apiClient.get<any>("/users/me"),
    enabled: isAuthenticated && !isHydrating,
  });

  // 3. 获取我发布的商品
  const { data: myItemsData, isLoading: isItemsLoading } = useQuery({
    queryKey: ["items", "my"],
    queryFn: () => apiClient.get<any>("/items", { params: { owner_id: user?.id } }),
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: { avatar_url?: string; bio?: string }) => 
      apiClient.patch("/users/me", data),
    onSuccess: () => {
      toast.success("资料更新成功");
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    },
    onError: (err: { message?: string }) => toast.error(err.message || "更新失败"),
  });

  const updateUsernameMutation = useMutation({
    mutationFn: (username: string) => apiClient.patch("/users/me/username", { username }),
    onSuccess: () => {
      toast.success("用户名已更新");
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    },
    onError: (err: { message?: string }) => toast.error(err.message || "更新失败"),
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      apiClient.patch("/users/me/password", data),
    onSuccess: () => {
      toast.success("密码已更新");
      setSettingsForm({ ...settingsForm, current_password: "", new_password: "" });
    },
    onError: (err: { message?: string }) => toast.error(err.message || "密码更新失败"),
  });

  const handleOpenEdit = () => {
    setEditForm({ 
      avatar_url: user?.avatar_url || "", 
      bio: user?.bio || "" 
    });
    setIsEditModalOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const result = await apiClient.upload(file);
      setEditForm({ ...editForm, avatar_url: result.url });
      toast.success("头像已上传");
    } catch {
      toast.error("头像上传失败");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(editForm);
  };

  const handleOpenSettings = () => {
    setSettingsForm({ username: user?.username || "", current_password: "", new_password: "" });
    setIsSettingsOpen(true);
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <div className="animate-pulse">加载中…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-muted-foreground p-6">
        <p>请先登录后查看个人中心</p>
        <Link href="/login?redirect=/profile" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20">
          去登录
        </Link>
      </div>
    );
  }

  // 加载与未登录拦截
  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p>加载个人信息中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-muted-foreground">
        <p>无法加载用户信息</p>
        <Link href="/login" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold">
          重新登录
        </Link>
      </div>
    );
  }

  const myItems = myItemsData?.items || [];
  const tradeStars = reputationToFiveScale(user.reputation_trade);
  const skillStars = reputationToFiveScale(user.reputation_skill);

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* 头部：用户信息区 */}
      <div className="bg-gradient-to-b from-primary/15 to-background px-4 pt-10 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg overflow-hidden border-4 border-background">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-100" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold">{user.username}</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded text-[10px] font-bold text-amber-700 border border-amber-200">
                  <Star size={12} className="fill-amber-500 text-amber-500" /> 交易 {tradeStars}
                </div>
                <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold text-blue-600 border border-blue-100">
                  <CheckCircle2 size={12} /> 技能 {skillStars}
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={handleOpenEdit}
            className="flex items-center gap-1 shrink-0 rounded-xl border bg-background/50 backdrop-blur-sm px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Edit size={14} /> 编辑
          </button>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mt-2 px-1">
          {user.bio || "点击编辑添加个人简介..."}
        </p>

        {/* 核心统计与入口 */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-card rounded-2xl p-3 flex flex-col items-center justify-center border shadow-sm">
            <span className="text-lg font-bold">{(user.trade_count || 0) + (user.skill_count || 0)}</span>
            <span className="text-[10px] text-muted-foreground font-medium">累计成交</span>
          </div>
          <Link href="/orders" className="bg-card rounded-2xl p-3 flex flex-col items-center justify-center border shadow-sm hover:bg-blue-50/50 hover:border-blue-200 transition-all group">
            <FileText className="w-5 h-5 mb-1 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] text-muted-foreground font-medium">我的订单</span>
          </Link>
          <Link href="/wishlists" className="bg-card rounded-2xl p-3 flex flex-col items-center justify-center border shadow-sm hover:bg-red-50/50 hover:border-red-200 transition-all group">
            <Heart className="w-5 h-5 mb-1 text-red-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] text-muted-foreground font-medium">心愿单</span>
          </Link>
        </div>
      </div>

      {/* 列表：我发布的内容 */}
      <div className="px-4 mt-4 space-y-4">
        <h2 className="font-bold text-lg flex items-center gap-2">
          我发布的
          <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full font-medium">
            {myItems.length}
          </span>
        </h2>
        
        <div className="space-y-3">
          {isItemsLoading ? (
             <div className="text-sm text-muted-foreground text-center py-10">加载商品中...</div>
          ) : myItems.length === 0 ? (
             <div className="text-center py-10 border-2 border-dashed rounded-3xl border-muted flex flex-col items-center justify-center gap-2">
               <Package size={32} className="text-muted-foreground/30" />
               <p className="text-sm text-muted-foreground">你还没有发布过任何内容</p>
               <Link href="/publish" className="text-primary text-xs font-bold hover:underline">去发布第一个商品</Link>
             </div>
          ) : (
            myItems.map((item: any) => (
              <Link key={item.id} href={`/marketplace/${item.id}`}>
                <div className="flex items-center gap-3 bg-card border rounded-2xl p-3 hover:shadow-md transition-all">
                  <div className="h-16 w-16 shrink-0 rounded-xl bg-muted overflow-hidden">
                    {item.cover_images?.[0] ? (
                       <img src={item.cover_images[0]} alt="cover" className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package size={20} /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                        item.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {item.status === 'active' ? '在售' : '已售出'}
                      </span>
                    </div>
                    <p className="font-bold text-primary mt-2">¥{item.price}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* 底部功能菜单 */}
        <div className="border rounded-2xl overflow-hidden divide-y bg-card mt-8 shadow-sm">
          <Link
            href="/chat"
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-muted/50 transition-colors text-left group"
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <MessageCircle size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              我的聊天
            </span>
            <span className="text-muted-foreground">›</span>
          </Link>
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-muted/50 transition-colors text-left text-muted-foreground cursor-not-allowed"
            disabled
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <Bookmark size={18} /> 我的收藏（即将上线）
            </span>
            <span>›</span>
          </button>
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-muted/50 transition-colors text-left text-muted-foreground cursor-not-allowed"
            disabled
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <Star size={18} /> 我的评价（即将上线）
            </span>
            <span>›</span>
          </button>
          <button type="button" onClick={handleOpenSettings} className="w-full flex items-center justify-between px-4 py-4 hover:bg-muted/50 transition-colors text-left group">
            <span className="flex items-center gap-3 text-sm font-medium">
              <Settings size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              账号设置
            </span>
            <span className="text-muted-foreground">›</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-red-50 transition-colors text-left group"
          >
            <span className="flex items-center gap-3 text-sm font-medium text-red-500">
              <LogOut size={18} /> 
              退出登录
            </span>
          </button>
        </div>
      </div>

      {/* 账号设置弹窗 */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">账号设置</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="p-1 hover:bg-muted rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold">修改用户名</label>
                <div className="flex gap-2">
                  <input
                    value={settingsForm.username}
                    onChange={(e) => setSettingsForm({ ...settingsForm, username: e.target.value })}
                    className="flex-1 rounded-xl border bg-muted/30 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => settingsForm.username.trim() && updateUsernameMutation.mutate(settingsForm.username.trim())}
                    disabled={updateUsernameMutation.isPending || !settingsForm.username.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-50"
                  >
                    保存
                  </button>
                </div>
              </div>
              <div className="space-y-2 border-t pt-4">
                <label className="text-sm font-semibold">修改密码</label>
                <input
                  type="password"
                  placeholder="当前密码"
                  value={settingsForm.current_password}
                  onChange={(e) => setSettingsForm({ ...settingsForm, current_password: e.target.value })}
                  className="w-full rounded-xl border bg-muted/30 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="password"
                  placeholder="新密码（至少8位，含字母和数字）"
                  value={settingsForm.new_password}
                  onChange={(e) => setSettingsForm({ ...settingsForm, new_password: e.target.value })}
                  className="w-full rounded-xl border bg-muted/30 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!settingsForm.current_password || !settingsForm.new_password) return toast.error("请填写完整");
                    updatePasswordMutation.mutate({
                      current_password: settingsForm.current_password,
                      new_password: settingsForm.new_password,
                    });
                  }}
                  disabled={updatePasswordMutation.isPending}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {updatePasswordMutation.isPending ? "修改中..." : "修改密码"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑资料弹窗 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">编辑资料</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Camera size={16} className="text-primary"/> 头像
                </label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted border overflow-hidden flex items-center justify-center shrink-0">
                    {editForm.avatar_url ? (
                      <img src={editForm.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={20} className="text-muted-foreground" />
                    )}
                  </div>
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-muted/30 text-sm font-medium cursor-pointer hover:bg-muted transition-colors">
                    <Upload size={14} />
                    {isUploadingAvatar ? "上传中..." : "上传头像"}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={isUploadingAvatar} />
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold">个人简介</label>
                <textarea 
                  value={editForm.bio}
                  onChange={e => setEditForm({...editForm, bio: e.target.value})}
                  rows={3}
                  placeholder="介绍一下你自己..."
                  className="w-full rounded-xl border bg-muted/30 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
              
              <button 
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
              >
                {updateProfileMutation.isPending ? "正在保存..." : "保存修改"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}