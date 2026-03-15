"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

// 定义匹配后端要求的 Zod Schema
const publishSchema = z.object({
  type: z.enum(["item", "skill"]),
  title: z.string().min(2, "标题至少 2 个字").max(50, "标题太长"),
  price: z.number().min(0, "价格不能为负"),
  price_mode: z.enum(["fixed", "negotiable"]),
  description: z.string().max(500, "描述不能超过500字").optional(),
  location_text: z.string().min(1, "请填写交易地点"),
  delivery_method: z.enum(["meetup", "offline", "online"]),
});

type PublishForm = z.infer<typeof publishSchema>;

export default function PublishPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PublishForm>({
    resolver: zodResolver(publishSchema),
    defaultValues: {
      type: "item",
      price_mode: "negotiable",
      delivery_method: "meetup",
    },
  });

  const watchType = watch("type");

  async function onSubmit(data: PublishForm) {
    setIsSubmitting(true);
    try {
      // 对接后端 POST /items 接口
      const res = await apiClient.post<{ id: number }>("/items", data);
      toast.success("发布成功！");
      router.push(`/marketplace/${res.id}`);
    } catch (error: any) {
      toast.error(error.message || "发布失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-muted text-lg">←</button>
        <h1 className="text-2xl font-bold">发布新内容</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-2xl border shadow-sm">
        
        <div className="space-y-2">
          <label className="text-sm font-medium">类型</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setValue("type", "item")}
              className={`flex-1 py-3 rounded-xl border-2 transition-all ${watchType === "item" ? "border-primary bg-primary/5 text-primary" : "border-muted"}`}
            >
              📦 闲置物品
            </button>
            <button
              type="button"
              onClick={() => setValue("type", "skill")}
              className={`flex-1 py-3 rounded-xl border-2 transition-all ${watchType === "skill" ? "border-purple-500 bg-purple-50 text-purple-600" : "border-muted"}`}
            >
              ⚡ 技能服务
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">标题</label>
          <input
            {...register("title")}
            placeholder={watchType === "item" ? "例如：九成新 MacBook Air M1" : "例如：高数一对一辅导"}
            className="w-full rounded-xl border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
          />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">价格 (元)</label>
            <input
              type="number"
              {...register("price", { valueAsNumber: true })}
              placeholder="0.00"
              className="w-full rounded-xl border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">是否可刀</label>
            <select
              {...register("price_mode")}
              className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="negotiable">可小刀</option>
              <option value="fixed">一口价</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">交易地点</label>
          <input
            {...register("location_text")}
            placeholder="例如：荔园食堂门口、线上"
            className="w-full rounded-xl border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
          />
          {errors.location_text && <p className="text-xs text-destructive">{errors.location_text.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">详细描述</label>
          <textarea
            {...register("description")}
            rows={4}
            placeholder="描述一下物品的成色、购买时间，或者技能的具体内容..."
            className="w-full rounded-xl border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

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