"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MultiImageUpload,
  type UploadedImageItem,
} from "@/components/upload/multi-image-upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function SellerUploadPage() {
  const [images, setImages] = useState<UploadedImageItem[]>([]);

  const totalOriginalSize = images.reduce(
    (sum, image) => sum + image.originalSize,
    0
  );
  const totalCompressedSize = images.reduce(
    (sum, image) => sum + image.compressedSize,
    0
  );
  const savedSize = Math.max(totalOriginalSize - totalCompressedSize, 0);
  const savedPercent =
    totalOriginalSize > 0
      ? Math.round((savedSize / totalOriginalSize) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 rounded-3xl border bg-card p-6 shadow-sm md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Seller Upload UI
            </span>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                卖家图片上传
              </h1>
              <p className="text-sm text-muted-foreground">
                这里先完成前端图片上传能力：多图选择、即时预览、单张删除和浏览器端压缩。
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button asChild type="button" variant="outline">
              <Link href="/profile">返回我的发布</Link>
            </Button>
            <Button asChild type="button" variant="outline">
              <Link href="/marketplace">返回市场</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <MultiImageUpload onChange={setImages} />

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>上传结果概览</CardTitle>
                <CardDescription>
                  用最小页面验证上传组件是否正常工作。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-muted p-4">
                    <p className="text-xs text-muted-foreground">图片数量</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {images.length}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-muted p-4">
                    <p className="text-xs text-muted-foreground">压缩节省</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {savedPercent}%
                    </p>
                  </div>
                </div>

                <div className="space-y-2 rounded-2xl border p-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">原始总大小</span>
                    <span className="font-medium">
                      {formatBytes(totalOriginalSize)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">压缩后总大小</span>
                    <span className="font-medium">
                      {formatBytes(totalCompressedSize)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">节省空间</span>
                    <span className="font-medium">{formatBytes(savedSize)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>当前范围</CardTitle>
                <CardDescription>
                  本次只完成前端上传交互，不涉及后端接口联调。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• 支持多图选择</p>
                <p>• 支持预览与单张删除</p>
                <p>• 支持清空全部</p>
                <p>• 支持浏览器端压缩</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
