# SUSTech Market 前端开发指南

> SUSTech 校园社交交易平台 — 前端脚手架说明与开发规范

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈](#2-技术栈)
3. [项目结构](#3-项目结构)
4. [核心模块说明](#4-核心模块说明)
   - 4.1 [响应式布局](#41-响应式布局)
   - 4.2 [API 客户端](#42-api-客户端)
   - 4.3 [认证状态管理](#43-认证状态管理)
   - 4.4 [Socket.IO 实时通信](#44-socketio-实时通信)
   - 4.5 [TanStack Query 数据请求](#45-tanstack-query-数据请求)
5. [后续开发指导](#5-后续开发指导)
   - 5.1 [添加新页面](#51-添加新页面)
   - 5.2 [接入后端 API](#52-接入后端-api)
   - 5.3 [表单开发（React Hook Form + Zod）](#53-表单开发)
   - 5.4 [实时通信（Socket.IO）](#54-实时通信)
   - 5.5 [地图功能（Leaflet）](#55-地图功能)
   - 5.6 [OpenAPI 代码自动生成](#56-openapi-代码自动生成)
6. [开发规范](#6-开发规范)
7. [常用命令](#7-常用命令)

---

## 1. 项目概述

本前端基于 **Next.js 14 App Router** 构建，支持 PC 和移动端响应式设计。

| 路由 | 功能 |
|------|------|
| `/marketplace` | 商品交易列表（首页） |
| `/marketplace/[id]` | 商品详情页 |
| `/chat` | 实时聊天 |
| `/map` | 校园地图 |
| `/profile` | 个人中心 |
| `/login` | 登录 |
| `/register` | 注册 |

后端通过 `next.config.ts` 的 rewrites 代理到 Flask（`http://localhost:5000`），前端只需请求 `/api/*`。

---

## 2. 技术栈

| 分类 | 库 | 版本 | 用途 |
|------|----|------|------|
| 框架 | Next.js | 16 | App Router、SSR/SSG |
| UI | React | 19 | 视图层 |
| 语言 | TypeScript | 5 | 类型安全 |
| 样式 | Tailwind CSS | 4 | 原子化 CSS |
| 组件库 | shadcn/ui | latest | 可复用 UI 组件 |
| 数据请求 | TanStack Query | 5 | 服务端状态、缓存、loading |
| 全局状态 | Zustand | 5 | 客户端状态（如认证信息） |
| 表单 | React Hook Form + Zod | 7 / 4 | 表单验证 |
| 实时通信 | Socket.IO Client | 4 | WebSocket 聊天 |
| 地图 | Leaflet + react-leaflet | 1 / 5 | 校园地图 |
| API 生成 | openapi-typescript-codegen | 0.30 | 从 OpenAPI spec 自动生成 |

---

## 3. 项目结构

```
frontend/
├── src/
│   ├── app/                        # Next.js App Router 路由
│   │   ├── layout.tsx              # 根布局（字体、QueryProvider、Toaster）
│   │   ├── page.tsx                # 首页 → redirect /marketplace
│   │   ├── globals.css             # Tailwind + shadcn/ui CSS 变量
│   │   ├── (auth)/                 # 路由分组：不含导航栏
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── marketplace/
│   │   │   ├── layout.tsx          # 包裹 AppShell
│   │   │   ├── page.tsx            # 商品列表
│   │   │   └── [id]/page.tsx       # 商品详情（动态路由）
│   │   ├── chat/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── map/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── profile/
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/                     # shadcn/ui 组件（自动生成，勿手动修改）
│   │   ├── layout/
│   │   │   ├── app-shell.tsx       # 响应式容器（Sidebar + MobileNav）
│   │   │   ├── sidebar.tsx         # PC 左侧导航（md 及以上显示）
│   │   │   └── mobile-nav.tsx      # 移动端底部 Tab（md 以下显示）
│   │   └── providers/
│   │       └── query-provider.tsx  # TanStack QueryClientProvider
│   ├── hooks/
│   │   └── use-media-query.ts      # 响应式断点 hook
│   ├── lib/
│   │   ├── utils.ts                # cn() 合并 className 工具
│   │   ├── api-client.ts           # fetch 封装（baseURL、JWT 注入、错误处理）
│   │   └── socket.ts               # Socket.IO 单例配置
│   ├── stores/
│   │   └── auth-store.ts           # Zustand 认证状态
│   └── api/                        # OpenAPI 自动生成（已加入 .gitignore）
├── next.config.ts                  # API 代理 /api/* → Flask :5000
├── package.json                    # scripts: dev / build / generate-api
└── .gitignore
```

---

## 4. 核心模块说明

### 4.1 响应式布局

**文件**: `src/components/layout/`

断点：`md`（768px）
- **>= 768px**：显示 `Sidebar`（左侧 60px 固定宽度导航）
- **< 768px**：显示 `MobileNav`（底部 fixed Tab 栏）

`AppShell` 是二者的容器，在需要导航栏的页面通过 `layout.tsx` 包裹：

```tsx
// app/marketplace/layout.tsx
import { AppShell } from "@/components/layout/app-shell";

export default function MarketplaceLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
```

登录/注册页属于 `(auth)` 路由分组，**不使用** AppShell，因此没有导航栏。

---

### 4.2 API 客户端

**文件**: `src/lib/api-client.ts`

封装了 `fetch`，自动从 `localStorage` 读取 JWT Token 并注入 `Authorization` 头：

```ts
import { apiClient } from "@/lib/api-client";

// GET
const items = await apiClient.get<Item[]>("/items");

// POST
const result = await apiClient.post<Item>("/items", { title: "旧书", price: 20 });

// PUT / DELETE
await apiClient.put("/items/1", { price: 15 });
await apiClient.delete("/items/1");
```

错误处理：非 2xx 状态码抛出 `ApiError`，包含 `status` 和 `message` 字段。

---

### 4.3 认证状态管理

**文件**: `src/stores/auth-store.ts`

使用 Zustand 管理登录状态：

```ts
import { useAuthStore } from "@/stores/auth-store";

// 组件内使用
function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  return <span>{user?.username}</span>;
}

// 登录成功后
useAuthStore.getState().setAuth(user, token);

// 退出登录
useAuthStore.getState().logout();
```

Token 同时存入 `localStorage`，刷新页面后 `api-client.ts` 仍可读取。

---

### 4.4 Socket.IO 实时通信

**文件**: `src/lib/socket.ts`

采用单例模式，避免重复创建连接：

```ts
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";

// 登录后连接
connectSocket(token);

// 监听事件
const socket = getSocket();
socket.on("new_message", (msg) => {
  // 处理新消息
});

// 发送消息
socket.emit("send_message", { roomId: "123", content: "你好" });

// 退出时断开
disconnectSocket();
```

---

### 4.5 TanStack Query 数据请求

**文件**: `src/components/providers/query-provider.tsx`

已在根 `layout.tsx` 中全局注册。在组件内直接使用：

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

// 查询
function ItemList() {
  const { data, isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: () => apiClient.get<Item[]>("/items"),
  });
}

// 变更（POST/PUT/DELETE）
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: (data) => apiClient.post("/items", data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
});
```

---

## 5. 后续开发指导

### 5.1 添加新页面

**Step 1**: 在 `src/app/` 下创建目录和 `page.tsx`。

```
src/app/orders/page.tsx
src/app/orders/layout.tsx   # 若需要导航栏
```

**Step 2**: 若需要导航栏，`layout.tsx` 包裹 `AppShell`：

```tsx
import { AppShell } from "@/components/layout/app-shell";

export default function OrdersLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
```

**Step 3**: 若需要加入底部/侧边导航，编辑 `sidebar.tsx` 和 `mobile-nav.tsx` 中的 `navItems` 数组：

```ts
const navItems = [
  { href: "/marketplace", label: "市场", icon: "🏪" },
  { href: "/orders",      label: "订单", icon: "📦" }, // 新增
  // ...
];
```

---

### 5.2 接入后端 API

**推荐方式**：TanStack Query + apiClient 组合。

**完整示例**（商品列表页）:

```tsx
// src/app/marketplace/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface Item {
  id: number;
  title: string;
  price: number;
  seller: string;
}

export default function MarketplacePage() {
  const { data: items, isLoading, isError } = useQuery({
    queryKey: ["items"],
    queryFn: () => apiClient.get<Item[]>("/items"),
  });

  if (isLoading) return <p>加载中...</p>;
  if (isError)   return <p>加载失败</p>;

  return (
    <div className="p-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {items?.map((item) => (
        <div key={item.id} className="rounded border p-3">
          <p className="font-bold">{item.title}</p>
          <p className="text-muted-foreground">¥{item.price}</p>
        </div>
      ))}
    </div>
  );
}
```

> 注意：从服务端组件（无 `"use client"`）调用 API 时，直接用 `apiClient.get()` 即可，无需 useQuery。

---

### 5.3 表单开发

**依赖**: React Hook Form + Zod + shadcn/ui 组件

**完整示例**（发布商品表单）:

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// 1. 定义 schema（Zod 自动推断类型）
const schema = z.object({
  title: z.string().min(2, "标题至少 2 个字"),
  price: z.number({ invalid_type_error: "请输入价格" }).positive("价格必须大于 0"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// 2. 使用表单
export function PublishForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    // 调用 API
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input {...register("title")} placeholder="商品标题" />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>
      <div>
        <Input {...register("price", { valueAsNumber: true })} type="number" placeholder="价格" />
        {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
      </div>
      <Button type="submit">发布</Button>
    </form>
  );
}
```

---

### 5.4 实时通信

**场景**：聊天页面接入 Socket.IO。

```tsx
"use client";

import { useEffect, useState } from "react";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/auth-store";

interface Message {
  id: string;
  content: string;
  sender: string;
}

export function ChatRoom({ roomId }: { roomId: string }) {
  const token = useAuthStore((s) => s.token);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const socket = connectSocket(token ?? undefined);

    socket.emit("join_room", { roomId });
    socket.on("new_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("new_message");
      disconnectSocket();
    };
  }, [roomId, token]);

  const sendMessage = (content: string) => {
    getSocket().emit("send_message", { roomId, content });
  };

  return (
    <div>
      {messages.map((m) => <p key={m.id}>{m.sender}: {m.content}</p>)}
    </div>
  );
}
```

---

### 5.5 地图功能

Leaflet 需要在客户端渲染（`"use client"`），且 CSS 需单独引入。

**基础地图组件**:

```tsx
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 修复 Leaflet 默认图标路径（Next.js 中必须）
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

// SUSTech 校区中心坐标
const SUSTECH_CENTER: [number, number] = [22.5996, 113.9939];

export function CampusMap() {
  return (
    <MapContainer
      center={SUSTECH_CENTER}
      zoom={16}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={SUSTECH_CENTER}>
        <Popup>南方科技大学</Popup>
      </Marker>
    </MapContainer>
  );
}
```

将 Leaflet 图标文件（`marker-icon.png` 等）放到 `public/leaflet/` 目录，或使用 CDN 图标。

> 注意：在页面中使用时需配合 `next/dynamic` 禁用 SSR：
> ```ts
> const CampusMap = dynamic(() => import("@/components/campus-map"), { ssr: false });
> ```

---

### 5.6 OpenAPI 代码自动生成

后端 Flask 通过 `http://localhost:5000/openapi.json` 暴露 OpenAPI spec，前端可自动生成类型安全的 API 客户端。

**运行生成命令**（确保后端已启动）:

```bash
npm run generate-api
```

等同于：
```bash
openapi --input http://localhost:5000/openapi.json --output src/api --client fetch
```

生成后 `src/api/` 目录会包含：
- `models/` — 所有请求/响应类型
- `services/` — 按 tag 分组的 API 调用函数
- `core/` — 基础 fetch 配置

使用示例：
```ts
import { ItemsService } from "@/api/services/ItemsService";

const items = await ItemsService.getItems();
```

> `src/api/` 已加入 `.gitignore`，每次环境搭建或后端 API 变更后需重新运行 `npm run generate-api`。

---

## 6. 开发规范

### 组件规范

| 规则 | 说明 |
|------|------|
| 服务端组件优先 | 无 `"use client"` 为默认，有交互/状态才加 |
| 文件命名 | 组件用 `kebab-case.tsx`，类型用 `PascalCase` |
| shadcn/ui 组件 | 从 `@/components/ui/` 引入，不修改源文件 |
| 业务组件 | 放 `@/components/` 下，按功能分目录 |

### 样式规范

- 使用 Tailwind 原子类，避免行内 `style`
- 响应式：移动优先（`md:`, `lg:` 等断点）
- 动态 className 使用 `cn()` 工具函数（来自 `@/lib/utils`）

```ts
import { cn } from "@/lib/utils";

<div className={cn("base-class", isActive && "active-class", className)} />
```

### 数据流规范

```
后端 Flask API
    ↓
next.config.ts 代理 /api/*
    ↓
api-client.ts (fetch + JWT)
    ↓
TanStack Query (缓存 + loading 状态)
    ↓
React 组件
```

全局状态（用户信息）用 **Zustand**，服务端数据用 **TanStack Query**，不要把 API 数据放进 Zustand。

---

## 7. 常用命令

```bash
# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm run start

# 类型检查 + Lint
npm run lint

# 从后端 OpenAPI spec 自动生成 API 客户端（需后端运行中）
npm run generate-api

# 安装新 shadcn/ui 组件（示例）
npx shadcn@latest add select
npx shadcn@latest add sheet
```

---

> 文档最后更新：2026-03-01
> 对应后端：Flask + Python，监听 `http://localhost:5000`
