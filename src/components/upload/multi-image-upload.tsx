"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface UploadedImageItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

interface MultiImageUploadProps {
  maxFiles?: number;
  maxDimension?: number;
  quality?: number;
  className?: string;
  onChange?: (images: UploadedImageItem[]) => void;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getCompressionPercent(originalSize: number, compressedSize: number) {
  if (originalSize <= 0 || compressedSize >= originalSize) {
    return 0;
  }
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}

function loadImageElement(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("图片加载失败"));
    };

    image.src = objectUrl;
  });
}

async function compressImage(
  file: File,
  maxDimension: number,
  quality: number
) {
  const image = await loadImageElement(file);
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("浏览器不支持图片压缩");
  }

  context.drawImage(image, 0, 0, width, height);

  const outputType =
    file.type === "image/png" ? "image/webp" : SUPPORTED_IMAGE_TYPES.includes(file.type) ? file.type : "image/jpeg";

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, outputType, quality)
  );

  if (!blob) {
    throw new Error("图片压缩失败");
  }

  const extension =
    outputType === "image/jpeg" ? "jpg" : outputType === "image/png" ? "png" : "webp";

  const compressedFile =
    blob.size < file.size
      ? new File([blob], file.name.replace(/\.[^.]+$/, `.${extension}`), {
          type: outputType,
          lastModified: Date.now(),
        })
      : file;

  return {
    file: compressedFile,
    width,
    height,
  };
}

export function MultiImageUpload({
  maxFiles = 6,
  maxDimension = 1600,
  quality = 0.82,
  className,
  onChange,
}: MultiImageUploadProps) {
  const [images, setImages] = useState<UploadedImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const imagesRef = useRef<UploadedImageItem[]>([]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, []);

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = event.target.files ? Array.from(event.target.files) : [];
    event.target.value = "";

    if (selectedFiles.length === 0) {
      return;
    }

    const supportedFiles = selectedFiles.filter((file) =>
      SUPPORTED_IMAGE_TYPES.includes(file.type)
    );
    const unsupportedCount = selectedFiles.length - supportedFiles.length;

    if (unsupportedCount > 0) {
      toast.error("存在不支持的文件类型", {
        description: "仅支持 JPG、PNG、WEBP 图片。",
      });
    }

    const availableSlots = maxFiles - images.length;
    if (availableSlots <= 0) {
      toast.error("已达到图片上限", {
        description: `最多只能上传 ${maxFiles} 张图片。`,
      });
      return;
    }

    const filesToProcess = supportedFiles.slice(0, availableSlots);
    if (supportedFiles.length > availableSlots) {
      toast.message("部分图片未加入", {
        description: `最多保留 ${maxFiles} 张图片，其余图片已忽略。`,
      });
    }

    setIsProcessing(true);
    try {
      const processedImages = await Promise.all(
        filesToProcess.map(async (file) => {
          const compressed = await compressImage(file, maxDimension, quality);
          const previewUrl = URL.createObjectURL(compressed.file);

          return {
            id: crypto.randomUUID(),
            file: compressed.file,
            previewUrl,
            name: compressed.file.name,
            originalSize: file.size,
            compressedSize: compressed.file.size,
            width: compressed.width,
            height: compressed.height,
          } satisfies UploadedImageItem;
        })
      );

      const nextImages = [...images, ...processedImages];
      setImages(nextImages);
      onChange?.(nextImages);

      toast.success("图片已加入", {
        description: `已处理 ${processedImages.length} 张图片，并自动完成压缩。`,
      });
    } catch (error) {
      toast.error("图片处理失败", {
        description:
          error instanceof Error ? error.message : "请稍后重试或更换图片。",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  function removeImage(id: string) {
    const target = images.find((image) => image.id === id);
    if (!target) {
      return;
    }

    URL.revokeObjectURL(target.previewUrl);
    const nextImages = images.filter((image) => image.id !== id);
    setImages(nextImages);
    onChange?.(nextImages);
  }

  function clearAll() {
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    setImages([]);
    onChange?.([]);
  }

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={inputRef}
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        type="file"
        onChange={handleFileSelect}
      />

      <div className="rounded-3xl border-2 border-dashed bg-muted/30 p-6 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
            🖼️
          </div>
          <div>
            <h3 className="text-base font-semibold">上传商品图片</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              支持多图上传、即时预览、单张删除，并在浏览器端自动压缩。
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <span>最多 {maxFiles} 张</span>
            <span>支持 JPG / PNG / WEBP</span>
            <span>自动压缩至最长边 {maxDimension}px</span>
          </div>
          <Button
            disabled={isProcessing}
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            {isProcessing ? "压缩处理中..." : "选择图片"}
          </Button>
        </div>
      </div>

      {images.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            已选择 <span className="font-semibold text-foreground">{images.length}</span> / {maxFiles} 张
          </div>
          <Button variant="ghost" type="button" onClick={clearAll}>
            清空全部
          </Button>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image) => {
            const compressionPercent = getCompressionPercent(
              image.originalSize,
              image.compressedSize
            );

            return (
              <article
                key={image.id}
                className="overflow-hidden rounded-3xl border bg-card shadow-sm"
              >
                <div className="relative aspect-square bg-muted">
                  <Image
                    alt={image.name}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    src={image.previewUrl}
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="absolute right-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm transition-opacity hover:opacity-90"
                  >
                    删除
                  </button>
                </div>
                <div className="space-y-2 p-4">
                  <div>
                    <p className="line-clamp-1 text-sm font-semibold">{image.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {image.width} × {image.height}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-2xl bg-muted px-3 py-2">
                      <p className="text-muted-foreground">原始大小</p>
                      <p className="mt-1 font-medium text-foreground">
                        {formatBytes(image.originalSize)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-muted px-3 py-2">
                      <p className="text-muted-foreground">压缩后</p>
                      <p className="mt-1 font-medium text-foreground">
                        {formatBytes(image.compressedSize)}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                    {compressionPercent > 0
                      ? `已压缩 ${compressionPercent}%`
                      : "已保留原图（无需进一步压缩）"}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
