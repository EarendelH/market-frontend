"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type ListingType = "goods" | "skills" | "lost";

interface PublishFormValues {
  title: string;
  description: string;
  campusArea: string;
  contact: string;
  tags: string;
  goodsCategory: string;
  goodsCondition: string;
  goodsPrice: string;
  originalPrice: string;
  tradeLocation: string;
  deliveryOption: string;
  skillCategory: string;
  serviceMode: string;
  pricingMode: string;
  skillPrice: string;
  availability: string;
  experience: string;
  lostItemType: string;
  lostDate: string;
  lostLocation: string;
  reward: string;
  contactMethod: string;
}

interface PublishedItemTemplate {
  id: string;
  listingType: ListingType;
  status: string;
  existingImageCount: number;
  formValues: PublishFormValues;
}

const LISTING_TYPE_OPTIONS: Array<{
  value: ListingType;
  label: string;
  description: string;
}> = [
  {
    value: "goods",
    label: "二手商品",
    description: "适合教材、电子产品、生活用品等实物交易。",
  },
  {
    value: "skills",
    label: "技能服务",
    description: "适合家教、拍照、设计、编程辅导等服务。",
  },
  {
    value: "lost",
    label: "失物招领",
    description: "适合寻物启事、拾到物品和悬赏寻找等场景。",
  },
];

const CAMPUS_AREAS = ["荔园", "南园", "北园", "工学院", "理学院", "图书馆"];
const GOODS_CATEGORIES = [
  "书籍教材",
  "电子产品",
  "生活用品",
  "服装配饰",
  "运动器材",
  "其他",
];
const GOODS_CONDITIONS = ["全新未拆", "九成新", "八成新", "七成新", "有使用痕迹"];
const DELIVERY_OPTIONS = ["当面交易", "自提优先", "可送到宿舍区", "可快递（后续联调）"];
const SKILL_CATEGORIES = [
  "课程辅导",
  "摄影/修图",
  "设计/PPT",
  "编程开发",
  "跑腿代办",
  "其他",
];
const SKILL_SERVICE_MODES = ["线上", "线下", "线上 / 线下均可"];
const SKILL_PRICING_OPTIONS = ["按小时", "按次", "可议价"];
const LOST_ITEM_TYPES = ["校园卡", "钥匙", "耳机", "证件", "背包/水杯", "其他"];
const LOST_CONTACT_METHODS = ["站内私信", "手机号", "微信", "QQ"];

const TEXTAREA_CLASS_NAME =
  "min-h-28 w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";
const SELECT_CLASS_NAME =
  "h-11 w-full rounded-2xl border border-input bg-transparent px-4 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

const PUBLISHED_ITEM_TEMPLATES: Record<string, PublishedItemTemplate> = {
  "5": {
    id: "5",
    listingType: "goods",
    status: "在售",
    existingImageCount: 3,
    formValues: {
      title: "机械键盘（青轴）",
      description:
        "宿舍自用，键帽和轴体状态都不错，适合拿来写代码或打字。因为准备换静音键盘，所以转出。",
      campusArea: "理学院",
      contact: "微信：sustech_keyboard",
      tags: "键盘,电子产品,宿舍好物",
      goodsCategory: "电子产品",
      goodsCondition: "九成新",
      goodsPrice: "220",
      originalPrice: "399",
      tradeLocation: "理学院门口 / 图书馆附近",
      deliveryOption: "当面交易",
      skillCategory: SKILL_CATEGORIES[0],
      serviceMode: SKILL_SERVICE_MODES[0],
      pricingMode: SKILL_PRICING_OPTIONS[0],
      skillPrice: "",
      availability: "",
      experience: "",
      lostItemType: LOST_ITEM_TYPES[0],
      lostDate: "",
      lostLocation: "",
      reward: "",
      contactMethod: LOST_CONTACT_METHODS[0],
    },
  },
  "11": {
    id: "11",
    listingType: "goods",
    status: "在售",
    existingImageCount: 2,
    formValues: {
      title: "哑铃一对 5kg×2",
      description:
        "一对 5kg 哑铃，宿舍健身用，外观有正常使用痕迹，不影响使用。适合日常力量训练。",
      campusArea: "南园",
      contact: "站内私信",
      tags: "健身,哑铃,运动器材",
      goodsCategory: "运动器材",
      goodsCondition: "九成新",
      goodsPrice: "55",
      originalPrice: "120",
      tradeLocation: "体育馆门口 / 南园附近",
      deliveryOption: "自提优先",
      skillCategory: SKILL_CATEGORIES[0],
      serviceMode: SKILL_SERVICE_MODES[0],
      pricingMode: SKILL_PRICING_OPTIONS[0],
      skillPrice: "",
      availability: "",
      experience: "",
      lostItemType: LOST_ITEM_TYPES[0],
      lostDate: "",
      lostLocation: "",
      reward: "",
      contactMethod: LOST_CONTACT_METHODS[0],
    },
  },
  "2": {
    id: "2",
    listingType: "goods",
    status: "已售",
    existingImageCount: 4,
    formValues: {
      title: "AirPods Pro 二代",
      description:
        "个人自用，功能正常，盒子和耳机均已清洁消毒。因为换了头戴耳机，所以低价出。",
      campusArea: "工学院",
      contact: "微信：airpods_seller",
      tags: "耳机,苹果,电子产品",
      goodsCategory: "电子产品",
      goodsCondition: "八成新",
      goodsPrice: "1200",
      originalPrice: "1999",
      tradeLocation: "工学院广场 / 图书馆门口",
      deliveryOption: "当面交易",
      skillCategory: SKILL_CATEGORIES[0],
      serviceMode: SKILL_SERVICE_MODES[0],
      pricingMode: SKILL_PRICING_OPTIONS[0],
      skillPrice: "",
      availability: "",
      experience: "",
      lostItemType: LOST_ITEM_TYPES[0],
      lostDate: "",
      lostLocation: "",
      reward: "",
      contactMethod: LOST_CONTACT_METHODS[0],
    },
  },
  "9": {
    id: "9",
    listingType: "goods",
    status: "已售",
    existingImageCount: 1,
    formValues: {
      title: "线性代数（同济第六版）",
      description:
        "教材保存完整，内页干净，只有少量铅笔笔记。适合大一课程复习和备考使用。",
      campusArea: "荔园",
      contact: "QQ：123456789",
      tags: "教材,线性代数,低价转让",
      goodsCategory: "书籍教材",
      goodsCondition: "八成新",
      goodsPrice: "15",
      originalPrice: "32",
      tradeLocation: "荔园宿舍楼下",
      deliveryOption: "当面交易",
      skillCategory: SKILL_CATEGORIES[0],
      serviceMode: SKILL_SERVICE_MODES[0],
      pricingMode: SKILL_PRICING_OPTIONS[0],
      skillPrice: "",
      availability: "",
      experience: "",
      lostItemType: LOST_ITEM_TYPES[0],
      lostDate: "",
      lostLocation: "",
      reward: "",
      contactMethod: LOST_CONTACT_METHODS[0],
    },
  },
};

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function normalizeListingType(value: string | null): ListingType {
  if (value === "skills" || value === "lost") {
    return value;
  }
  return "goods";
}

function createBlankFormValues(): PublishFormValues {
  return {
    title: "",
    description: "",
    campusArea: CAMPUS_AREAS[0],
    contact: "",
    tags: "",
    goodsCategory: GOODS_CATEGORIES[0],
    goodsCondition: GOODS_CONDITIONS[1],
    goodsPrice: "",
    originalPrice: "",
    tradeLocation: "",
    deliveryOption: DELIVERY_OPTIONS[0],
    skillCategory: SKILL_CATEGORIES[0],
    serviceMode: SKILL_SERVICE_MODES[0],
    pricingMode: SKILL_PRICING_OPTIONS[0],
    skillPrice: "",
    availability: "",
    experience: "",
    lostItemType: LOST_ITEM_TYPES[0],
    lostDate: "",
    lostLocation: "",
    reward: "",
    contactMethod: LOST_CONTACT_METHODS[0],
  };
}

function getListingTypeLabel(listingType: ListingType) {
  return (
    LISTING_TYPE_OPTIONS.find((item) => item.value === listingType)?.label ??
    "未分类"
  );
}

function getRequiredHint(listingType: ListingType) {
  switch (listingType) {
    case "goods":
      return "请完善标题、描述、联系方式、商品分类、成色、价格，并至少保留 1 张图片。";
    case "skills":
      return "请完善标题、描述、联系方式、技能分类、服务价格和可预约时间。";
    case "lost":
      return "请完善标题、描述、联系方式、物品类型、丢失时间、丢失地点，并至少保留 1 张图片。";
    default:
      return "";
  }
}

function getImageGuideText(
  listingType: ListingType,
  isEditMode: boolean,
  existingImageCount: number
) {
  if (isEditMode && existingImageCount > 0) {
    return `当前 item 已有 ${existingImageCount} 张历史图片；如果你想替换或补充图片，可以在这里重新选择。`;
  }

  switch (listingType) {
    case "goods":
      return "建议上传商品实拍图，帮助买家快速判断成色。";
    case "skills":
      return "可上传技能案例、作品截图、证书或服务示意图。";
    case "lost":
      return "建议上传物品照片或示意图，便于大家协助寻找。";
    default:
      return "";
  }
}

function getPreviewMeta(
  listingType: ListingType,
  formValues: PublishFormValues
): Array<{ label: string; value: string }> {
  switch (listingType) {
    case "goods":
      return [
        { label: "商品分类", value: formValues.goodsCategory },
        { label: "成色", value: formValues.goodsCondition },
        {
          label: "价格",
          value: formValues.goodsPrice ? `¥${formValues.goodsPrice}` : "待填写",
        },
        {
          label: "交易方式",
          value: formValues.deliveryOption || "待填写",
        },
      ];
    case "skills":
      return [
        { label: "技能分类", value: formValues.skillCategory },
        { label: "服务方式", value: formValues.serviceMode },
        {
          label: "服务价格",
          value: formValues.skillPrice ? `¥${formValues.skillPrice}` : "待填写",
        },
        {
          label: "可预约时间",
          value: formValues.availability || "待填写",
        },
      ];
    case "lost":
      return [
        { label: "物品类型", value: formValues.lostItemType },
        { label: "丢失日期", value: formValues.lostDate || "待填写" },
        { label: "丢失地点", value: formValues.lostLocation || "待填写" },
        {
          label: "悬赏金额",
          value: formValues.reward ? `¥${formValues.reward}` : "未设置",
        },
      ];
    default:
      return [];
  }
}

interface SellerPublishFormProps {
  initialListingType: ListingType;
  initialFormValues: PublishFormValues;
  editItem: PublishedItemTemplate | null;
  editRequestedButMissing: boolean;
}

function SellerPublishForm({
  initialListingType,
  initialFormValues,
  editItem,
  editRequestedButMissing,
}: SellerPublishFormProps) {
  const isEditMode = Boolean(editItem);
  const existingImageCount = editItem?.existingImageCount ?? 0;
  const [listingType, setListingType] = useState<ListingType>(initialListingType);
  const [formValues, setFormValues] =
    useState<PublishFormValues>(initialFormValues);
  const [images, setImages] = useState<UploadedImageItem[]>([]);
  const [submitted, setSubmitted] = useState(false);

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

  const requiresImages = listingType !== "skills";
  const hasCommonFields = Boolean(
    formValues.title.trim() &&
      formValues.description.trim() &&
      formValues.contact.trim()
  );
  const hasTypeSpecificFields =
    listingType === "goods"
      ? Boolean(
          formValues.goodsCategory &&
            formValues.goodsCondition &&
            formValues.goodsPrice.trim()
        )
      : listingType === "skills"
        ? Boolean(
            formValues.skillCategory &&
              formValues.skillPrice.trim() &&
              formValues.availability.trim()
          )
        : Boolean(
            formValues.lostItemType &&
              formValues.lostDate &&
              formValues.lostLocation.trim()
          );
  const hasRequiredImages = requiresImages
    ? images.length > 0 || existingImageCount > 0
    : true;
  const canSubmit = hasCommonFields && hasTypeSpecificFields && hasRequiredImages;
  const previewMeta = getPreviewMeta(listingType, formValues);

  function updateField<Key extends keyof PublishFormValues>(
    key: Key,
    value: PublishFormValues[Key]
  ) {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleListingTypeChange(nextType: ListingType) {
    setListingType(nextType);
    setSubmitted(false);
    setFormValues((current) => ({
      ...createBlankFormValues(),
      title: current.title,
      description: current.description,
      campusArea: current.campusArea,
      contact: current.contact,
      tags: current.tags,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      toast.error("请先完善必填项", {
        description: getRequiredHint(listingType),
      });
      return;
    }

    setSubmitted(true);
    toast.success(isEditMode ? "修改已保存" : "发布信息已生成", {
      description: `${getListingTypeLabel(listingType)} · ${formValues.title}`,
    });
  }

  function handleSaveDraft() {
    toast.message(isEditMode ? "编辑草稿已保存" : "发布草稿已保存", {
      description: "当前仅保留前端页面状态，不会同步到后端。",
    });
  }

  function renderTypeSpecificFields() {
    switch (listingType) {
      case "goods":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">商品分类</label>
                <select
                  value={formValues.goodsCategory}
                  onChange={(event) =>
                    updateField("goodsCategory", event.target.value)
                  }
                  className={SELECT_CLASS_NAME}
                >
                  {GOODS_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">价格（元）</label>
                <Input
                  placeholder="例如 220"
                  type="number"
                  value={formValues.goodsPrice}
                  onChange={(event) =>
                    updateField("goodsPrice", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">商品成色</label>
              <div className="flex flex-wrap gap-2">
                {GOODS_CONDITIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => updateField("goodsCondition", item)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      formValues.goodsCondition === item
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-muted"
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">原价（可选）</label>
                <Input
                  placeholder="例如 399"
                  type="number"
                  value={formValues.originalPrice}
                  onChange={(event) =>
                    updateField("originalPrice", event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">交易方式</label>
                <select
                  value={formValues.deliveryOption}
                  onChange={(event) =>
                    updateField("deliveryOption", event.target.value)
                  }
                  className={SELECT_CLASS_NAME}
                >
                  {DELIVERY_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">交易地点说明（可选）</label>
              <Input
                placeholder="例如：理学院门口 / 晚上可在荔园交易"
                value={formValues.tradeLocation}
                onChange={(event) =>
                  updateField("tradeLocation", event.target.value)
                }
              />
            </div>
          </div>
        );

      case "skills":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">技能分类</label>
                <select
                  value={formValues.skillCategory}
                  onChange={(event) =>
                    updateField("skillCategory", event.target.value)
                  }
                  className={SELECT_CLASS_NAME}
                >
                  {SKILL_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">计费方式</label>
                <select
                  value={formValues.pricingMode}
                  onChange={(event) =>
                    updateField("pricingMode", event.target.value)
                  }
                  className={SELECT_CLASS_NAME}
                >
                  {SKILL_PRICING_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">服务方式</label>
              <div className="flex flex-wrap gap-2">
                {SKILL_SERVICE_MODES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => updateField("serviceMode", item)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      formValues.serviceMode === item
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-muted"
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">服务价格（元）</label>
                <Input
                  placeholder="例如 80"
                  type="number"
                  value={formValues.skillPrice}
                  onChange={(event) =>
                    updateField("skillPrice", event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">可预约时间</label>
                <Input
                  placeholder="例如：周二周四晚 / 周末下午"
                  value={formValues.availability}
                  onChange={(event) =>
                    updateField("availability", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">经验介绍（可选）</label>
              <textarea
                value={formValues.experience}
                onChange={(event) =>
                  updateField("experience", event.target.value)
                }
                placeholder="例如：是否有过往案例、作品集、辅导经验、获奖经历等"
                className={TEXTAREA_CLASS_NAME}
              />
            </div>
          </div>
        );

      case "lost":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">物品类型</label>
                <select
                  value={formValues.lostItemType}
                  onChange={(event) =>
                    updateField("lostItemType", event.target.value)
                  }
                  className={SELECT_CLASS_NAME}
                >
                  {LOST_ITEM_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">丢失日期</label>
                <Input
                  type="date"
                  value={formValues.lostDate}
                  onChange={(event) =>
                    updateField("lostDate", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">丢失地点</label>
                <Input
                  placeholder="例如：图书馆一楼靠窗区域"
                  value={formValues.lostLocation}
                  onChange={(event) =>
                    updateField("lostLocation", event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">悬赏金额（可选）</label>
                <Input
                  placeholder="例如 50"
                  type="number"
                  value={formValues.reward}
                  onChange={(event) => updateField("reward", event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">联系方式类型</label>
                <select
                  value={formValues.contactMethod}
                  onChange={(event) =>
                    updateField("contactMethod", event.target.value)
                  }
                  className={SELECT_CLASS_NAME}
                >
                  {LOST_CONTACT_METHODS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">当前联系渠道</label>
                <Input
                  placeholder="例如：微信 / 手机号 / 站内私信"
                  value={formValues.contact}
                  onChange={(event) =>
                    updateField("contact", event.target.value)
                  }
                />
              </div>
            </div>
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:p-6"
      >
        <div className="flex flex-col gap-4 rounded-3xl border bg-card p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {isEditMode ? "Edit Published Item" : "Publish Form"}
            </span>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                {isEditMode ? "编辑我发布的内容" : "发布新信息"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? "当前页面已根据你在“我的发布”里点击的 item 自动回填表单。"
                  : "当前页面用于新建发布，支持二手商品、技能服务、失物招领三种类型。"}
              </p>
            </div>
            {editRequestedButMissing && (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                没有找到对应的已发布 item，已回退到发布模式。
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/profile">返回我的发布</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/marketplace">返回市场</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>当前模式</CardTitle>
                <CardDescription>
                  {isEditMode
                    ? "编辑模式绑定到你已发布的 item，不再是通用示例。"
                    : "发布模式下可以新建不同类型的信息。"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {isEditMode ? "编辑模式" : "发布模式"}
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {getListingTypeLabel(listingType)}
                  </span>
                  {editItem && (
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      item #{editItem.id} · {editItem.status}
                    </span>
                  )}
                </div>
                {isEditMode ? (
                  <p className="text-sm text-muted-foreground">
                    如果你是从“我的发布”进入，这里编辑的就是对应 item 的前端表单数据。
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    你可以先选择发布类型，再填写对应字段。
                  </p>
                )}
              </CardContent>
            </Card>

            {!isEditMode && (
              <Card>
                <CardHeader>
                  <CardTitle>选择发布类型</CardTitle>
                  <CardDescription>
                    切换类型后，表单会显示对应的动态字段。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs
                    value={listingType}
                    onValueChange={(value) =>
                      handleListingTypeChange(value as ListingType)
                    }
                  >
                    <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-transparent p-0 md:grid-cols-3">
                      {LISTING_TYPE_OPTIONS.map((item) => (
                        <TabsTrigger
                          key={item.value}
                          value={item.value}
                          className="flex h-full min-h-20 flex-col items-start rounded-2xl border bg-muted/40 px-4 py-4 text-left data-[state=active]:border-primary data-[state=active]:bg-primary/5"
                        >
                          <span className="font-medium">{item.label}</span>
                          <span className="mt-1 text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>通用信息</CardTitle>
                <CardDescription>
                  这些字段会在三种类型下复用，减少重复录入。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">标题</label>
                    <Input
                      placeholder={
                        listingType === "goods"
                          ? "例如：高等数学教材（第七版）"
                          : listingType === "skills"
                            ? "例如：高数期中一对一辅导"
                            : "例如：寻找黑色校园卡套"
                      }
                      value={formValues.title}
                      onChange={(event) =>
                        updateField("title", event.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">校内区域</label>
                    <select
                      value={formValues.campusArea}
                      onChange={(event) =>
                        updateField("campusArea", event.target.value)
                      }
                      className={SELECT_CLASS_NAME}
                    >
                      {CAMPUS_AREAS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">详细描述</label>
                  <textarea
                    value={formValues.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    placeholder={
                      listingType === "goods"
                        ? "补充商品状态、购买时间、瑕疵说明、交易备注等"
                        : listingType === "skills"
                          ? "补充服务内容、适用对象、可交付结果等"
                          : "补充丢失经过、时间线、物品特征、感谢说明等"
                    }
                    className={TEXTAREA_CLASS_NAME}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">联系方式</label>
                    <Input
                      placeholder="例如：微信 / 手机号 / 站内私信"
                      value={formValues.contact}
                      onChange={(event) =>
                        updateField("contact", event.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">标签（可选）</label>
                    <Input
                      placeholder="例如：教材,九成新,可议价"
                      value={formValues.tags}
                      onChange={(event) =>
                        updateField("tags", event.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{getListingTypeLabel(listingType)}字段</CardTitle>
                <CardDescription>
                  根据当前类型动态展示对应字段。
                </CardDescription>
              </CardHeader>
              <CardContent>{renderTypeSpecificFields()}</CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>上传图片</CardTitle>
                <CardDescription>
                  {getImageGuideText(listingType, isEditMode, existingImageCount)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MultiImageUpload onChange={setImages} />
              </CardContent>
            </Card>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={handleSaveDraft}>
                保存草稿
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {isEditMode ? "保存修改" : "发布信息"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>表单概览</CardTitle>
                <CardDescription>
                  右侧实时预览当前模式、类型和关键字段。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {isEditMode ? "编辑态" : "发布态"}
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {getListingTypeLabel(listingType)}
                  </span>
                </div>

                <div className="rounded-2xl border p-4">
                  <p className="text-xs text-muted-foreground">标题预览</p>
                  <p className="mt-1 font-semibold">
                    {formValues.title || "尚未填写标题"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formValues.description || "这里会展示你输入的描述摘要。"}
                  </p>
                </div>

                <div className="space-y-3 rounded-2xl border p-4 text-sm">
                  {previewMeta.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start justify-between gap-3"
                    >
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-right font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900">
                  <p className="font-semibold">提交前检查</p>
                  <p className="mt-1 text-amber-800">
                    {canSubmit ? "当前必填项已完成，可以提交。" : getRequiredHint(listingType)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>图片概览</CardTitle>
                <CardDescription>
                  编辑模式下，历史图片不会在这里逐张回显，但会计入“已有图片”。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-muted p-4">
                    <p className="text-xs text-muted-foreground">已有图片</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {existingImageCount}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-muted p-4">
                    <p className="text-xs text-muted-foreground">新选图片</p>
                    <p className="mt-1 text-2xl font-semibold">{images.length}</p>
                  </div>
                </div>

                <div className="space-y-2 rounded-2xl border p-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">本次原始大小</span>
                    <span className="font-medium">
                      {formatBytes(totalOriginalSize)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">本次压缩后</span>
                    <span className="font-medium">
                      {formatBytes(totalCompressedSize)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">本次节省空间</span>
                    <span className="font-medium">{formatBytes(savedSize)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">本次节省比例</span>
                    <span className="font-medium">{savedPercent}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>当前提交结果</CardTitle>
                <CardDescription>
                  仅展示前端页面状态，不会真正写入后端。
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm">
                    <p className="font-semibold text-emerald-900">
                      {isEditMode ? "修改预览已保存" : "发布预览已生成"}
                    </p>
                    <div className="mt-2 space-y-1 text-emerald-800">
                      <p>类型：{getListingTypeLabel(listingType)}</p>
                      <p>标题：{formValues.title}</p>
                      <p>区域：{formValues.campusArea}</p>
                      <p>图片保留：{existingImageCount + images.length}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    提交后，这里会展示当前表单的前端结果摘要。
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function SellerUploadPage() {
  const searchParams = useSearchParams();
  const requestedMode = searchParams.get("mode");
  const requestedId = searchParams.get("id") ?? "";
  const requestedType = normalizeListingType(searchParams.get("type"));
  const editItem =
    requestedMode === "edit" ? PUBLISHED_ITEM_TEMPLATES[requestedId] ?? null : null;
  const editRequestedButMissing = requestedMode === "edit" && !editItem;
  const initialListingType = editItem?.listingType ?? requestedType;
  const initialFormValues = editItem
    ? { ...editItem.formValues }
    : createBlankFormValues();

  return (
    <SellerPublishForm
      key={`${requestedMode ?? "publish"}-${requestedId}-${requestedType}`}
      editItem={editItem}
      editRequestedButMissing={editRequestedButMissing}
      initialFormValues={initialFormValues}
      initialListingType={initialListingType}
    />
  );
}
