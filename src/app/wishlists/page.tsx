"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Heart, Plus, Edit2, Trash2, X, Power, PowerOff } from "lucide-react";

// 定义心愿单数据结构
interface Wishlist {
  id: number;
  user_id: number;
  keyword: string;
  max_price: number;
  status: "active" | "inactive";
  created_at: string;
}

export default function WishlistsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 弹窗与表单状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Wishlist | null>(null);
  const [form, setForm] = useState({ keyword: "", max_price: "" });

  // 1. 获取我的心愿单列表
  const { data: wishlists = [], isLoading } = useQuery({
    queryKey: ["wishlists"],
    queryFn: () => apiClient.get<Wishlist[]>("/wishlists"),
  });

  // 2. 新增心愿单 Mutation
  const createMutation = useMutation({
    mutationFn: (data: { keyword: string; max_price: number }) => 
      apiClient.post("/wishlists", data),
    onSuccess: () => {
      toast.success("心愿单发布成功！");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
    onError: (err: any) => toast.error(err.message || "发布失败"),
  });

  // 3. 更新心愿单 Mutation (修改价格或状态)
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Wishlist> }) => 
      apiClient.patch(`/wishlists/${id}`, data),
    onSuccess: () => {
      toast.success("更新成功！");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
    onError: (err: any) => toast.error(err.message || "更新失败"),
  });

  // 4. 删除心愿单 Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/wishlists/${id}`),
    onSuccess: () => {
      toast.success("心愿单已删除");
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
    onError: (err: any) => toast.error(err.message || "删除失败"),
  });

  // 打开/关闭弹窗处理
  const openCreateModal = () => {
    setEditingItem(null);
    setForm({ keyword: "", max_price: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Wishlist) => {
    setEditingItem(item);
    setForm({ keyword: item.keyword, max_price: item.max_price.toString() });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.keyword.trim()) return toast.error("请输入关键词");
    if (!form.max_price || isNaN(Number(form.max_price))) return toast.error("请输入有效的预期价格");

    const payload = {
      keyword: form.keyword.trim(),
      max_price: Number(form.max_price),
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: { max_price: payload.max_price } });
    } else {
      createMutation.mutate(payload);
    }
  };

  // 切换状态快捷操作
  const toggleStatus = (item: Wishlist) => {
    const newStatus = item.status === "active" ? "inactive" : "active";
    updateMutation.mutate({ id: item.id, data: { status: newStatus } });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="rounded-full p-1.5 hover:bg-muted transition-colors text-lg leading-none">←</button>
          <h1 className="font-bold text-lg">我的心愿单</h1>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-primary/20 transition-colors"
        >
          <Plus size={16} /> 添加
        </button>
      </div>

      {/* 心愿单列表 */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-10">加载中...</div>
        ) : wishlists.length === 0 ? (
          <div className="text-center text-muted-foreground py-20 flex flex-col items-center gap-3">
            <div className="bg-muted p-4 rounded-full"><Heart size={40} className="opacity-20" /></div>
            <p>你还没有发布任何心愿单</p>
            <button onClick={openCreateModal} className="mt-2 text-primary text-sm font-medium hover:underline">
              立即发布一个
            </button>
          </div>
        ) : (
          wishlists.map((item) => (
            <div key={item.id} className="bg-card border rounded-2xl p-4 shadow-sm flex flex-col gap-3 transition-opacity" style={{ opacity: item.status === 'inactive' ? 0.6 : 1 }}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {item.keyword}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${item.status === 'active' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                      {item.status === 'active' ? '寻找中' : '已失效'}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    发布于 {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">预期最高价</p>
                  <p className="text-lg font-bold text-primary">¥{item.max_price}</p>
                </div>
              </div>

              {/* 操作底栏 */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-dashed mt-1">
                <button 
                  onClick={() => toggleStatus(item)}
                  disabled={updateMutation.isPending}
                  className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                >
                  {item.status === 'active' ? <><PowerOff size={14} /> 设为失效</> : <><Power size={14} /> 重新激活</>}
                </button>
                <button 
                  onClick={() => openEditModal(item)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => {
                    if (confirm("确定要删除这条心愿单吗？")) deleteMutation.mutate(item.id);
                  }}
                  disabled={deleteMutation.isPending}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 创建/编辑 弹窗 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background w-full max-w-sm rounded-3xl p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">{editingItem ? "修改预期价格" : "发布新心愿单"}</h2>
              <button onClick={closeModal} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">想寻找什么物品/技能？</label>
                <input
                  type="text"
                  placeholder="例如：二手 iPad Pro"
                  value={form.keyword}
                  onChange={(e) => setForm({ ...form, keyword: e.target.value })}
                  disabled={!!editingItem} // 编辑时通常不允许改关键词，只改价格或状态
                  className="w-full rounded-xl border bg-muted/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium">你能接受的最高价格 (元)</label>
                <input
                  type="number"
                  placeholder="例如：3000"
                  value={form.max_price}
                  onChange={(e) => setForm({ ...form, max_price: e.target.value })}
                  className="w-full rounded-xl border bg-muted/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full rounded-xl bg-primary py-3.5 mt-2 font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? "提交中..." : "确认保存"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}