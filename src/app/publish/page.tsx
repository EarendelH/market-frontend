"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";

const baseSchema = z.object({
  type: z.enum(["item", "skill", "lost", "errand"]),
  title: z.string().min(2, "标题至少 2 个字").max(80, "标题过长"),
  price: z.number().min(0, "价格不能为负"),
  price_mode: z.enum(["fixed", "negotiable"]),
  description: z.string().max(800, "描述过长").optional(),
  location_text: z.string().min(1, "请填写地点或线上"),
  delivery_method: z.enum(["meetup", "offline", "online"]),
  category_id: z.number().optional(),
  available_time_text: z.string().max(200).optional(),
});

type PublishForm = z.infer<typeof baseSchema>;

export default function PublishPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrating } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isHydrating) return;
    if (!isAuthenticated) {
      toast.message("请先登录", { description: "发布需要南科大账号" });
      router.replace("/login?redirect=/publish");
    }
  }, [isHydrating, isAuthenticated, router]);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PublishForm>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      type: "item",
      price_mode: "negotiable",
      delivery_method: "meetup",
      category_id: 1,
    },
  });

  const watchType = watch("type");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - imageFiles.length;
    const toAdd = files.slice(0, remaining);
    if (files.length > remaining) toast.info(`最多上传 3 张图片，已自动截取前 ${remaining} 张`);
    const newFiles = [...imageFiles, ...toAdd];
    setImageFiles(newFiles);
    const newPreviews = toAdd.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(data: PublishForm) {
    setIsSubmitting(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of imageFiles) {
        const result = await apiClient.upload(file);
        uploadedUrls.push(result.url);
      }
      const payload: Record<string, unknown> = {
        type: data.type,
        title: data.title,
        price: data.price,
        price_mode: data.price_mode,
        description: data.description || "",
        location_text: data.location_text,
        delivery_method: data.delivery_method,
        category_id: data.category_id,
        available_time_text: data.available_time_text || undefined,
        cover_images: uploadedUrls.length ? uploadedUrls : undefined,
      };
      const res = await apiClient.post<{ id: number }>("/items", payload);
      toast.success("发布成功！");
      router.push(`/marketplace/${res.id}`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "发布失败，请重试";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isHydrating || !isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto p-6 min-h-screen flex items-center justify-center text-muted-foreground">
        校验登录状态…
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button type="button" onClick={() => router.back()} className="p-2 rounded-full hover:bg-muted text-lg">
          ←
        </button>
        <h1 className="text-2xl font-bold">发布</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-2xl border shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium">类型</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setValue("type", "item")}
              className={`py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                watchType === "item" ? "border-primary bg-primary/5 text-primary" : "border-muted"
              }`}
            >
              二手物品
            </button>
            <button
              type="button"
              onClick={() => setValue("type", "skill")}
              className={`py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                watchType === "skill" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-muted"
              }`}
            >
              技能交换
            </button>
            <button
              type="button"
              onClick={() => {
                setValue("type", "lost");
                setValue("price", 0);
              }}
              className={`py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                watchType === "lost" ? "border-amber-500 bg-amber-50 text-amber-800" : "border-muted"
              }`}
            >
              失物招领
            </button>
            <button
              type="button"
              onClick={() => setValue("type", "errand")}
              className={`py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                watchType === "errand" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-muted"
              }`}
            >
              跑腿 / 代取
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">分类（教材/电子等）</label>
          <select
            {...register("category_id", { valueAsNumber: true })}
            className="w-full rounded-xl border bg-background px-4 py-3 outline-none"
          >
            <option value={1}>教材 / 书籍</option>
            <option value={2}>电子产品</option>
            <option value={3}>生活用品</option>
            <option value={4}>其它</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">标题</label>
          <input
            {...register("title")}
            placeholder={watchType === "lost" ? "例如：捡到校园卡（已打码）" : "例如：线性代数教材（九成新）"}
            className="w-full rounded-xl border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
          />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{watchType === "lost" ? "标价（可填 0）" : "价格 (元)"}</label>
            <input
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
              className="w-full rounded-xl border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">议价</label>
            <select {...register("price_mode")} className="w-full rounded-xl border bg-background px-4 py-3 outline-none">
              <option value="negotiable">可小刀</option>
              <option value="fixed">一口价</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">交易 / 见面地点</label>
          <input
            {...register("location_text")}
            placeholder="图书馆门口、学生中心、线上等"
            className="w-full rounded-xl border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
          />
          {errors.location_text && <p className="text-xs text-destructive">{errors.location_text.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">可交易时间（选填）</label>
          <input
            {...register("available_time_text")}
            placeholder="例如：周二/周四 18:00–20:00"
            className="w-full rounded-xl border bg-background px-4 py-2.5 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">交付方式</label>
          <select {...register("delivery_method")} className="w-full rounded-xl border bg-background px-4 py-3 outline-none">
            <option value="meetup">当面交易</option>
            <option value="offline">线下其它</option>
            <option value="online">线上</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">商品图片（最多 3 张，每张不超过 5MB）</label>
          <div className="flex gap-3 flex-wrap">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border bg-muted group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {imageFiles.length < 3 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <ImagePlus size={20} />
                <span className="text-[10px]">添加图片</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">详细描述</label>
          <textarea
            {...register("description")}
            rows={4}
            placeholder="成色、课程名、技能互换内容等"
            className="w-full rounded-xl border bg-background px-4 py-2.5 outline-none resize-none"
          />
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          发布即表示同意校园交易安全提示；修改商品信息后，匹配推送在完整实现中应带冷却去重。
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isSubmitting ? "正在发布..." : "确认发布"}
        </button>
      </form>
    </div>
  );
}
