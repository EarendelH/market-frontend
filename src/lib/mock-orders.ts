export type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type OrderViewerRole = "buyer" | "seller";

export interface MockOrder {
  id: string;
  itemId: string;
  itemTitle: string;
  itemEmoji: string;
  itemGradient: string;
  price: number;
  buyerName: string;
  sellerName: string;
  status: OrderStatus;
  viewerRole: OrderViewerRole;
  createdAt: string;
  meetingTime: string;
  meetingLocation: string;
  note: string;
}

export const mockOrders: MockOrder[] = [
  {
    id: "ord-2001",
    itemId: "5",
    itemTitle: "机械键盘（青轴）",
    itemEmoji: "⌨️",
    itemGradient: "from-emerald-400 to-green-600",
    price: 220,
    buyerName: "周同学",
    sellerName: "刘同学",
    status: "pending",
    viewerRole: "seller",
    createdAt: "2026-04-18 09:30",
    meetingTime: "2026-04-20 · 14:00 - 15:00",
    meetingLocation: "理学院一楼大厅",
    note: "买家已提交订单，等待卖家接受并确认线下交易安排。",
  },
  {
    id: "ord-2002",
    itemId: "8",
    itemTitle: "iPad mini 6 WiFi 256G",
    itemEmoji: "📱",
    itemGradient: "from-zinc-400 to-gray-600",
    price: 2800,
    buyerName: "林同学",
    sellerName: "周同学",
    status: "confirmed",
    viewerRole: "buyer",
    createdAt: "2026-04-17 19:10",
    meetingTime: "2026-04-19 · 19:00 - 20:00",
    meetingLocation: "工学院广场喷泉旁",
    note: "卖家已接受订单，买家完成验货后需要确认收货。",
  },
  {
    id: "ord-2003",
    itemId: "1",
    itemTitle: "高等数学教材（第七版）",
    itemEmoji: "📚",
    itemGradient: "from-blue-400 to-blue-600",
    price: 25,
    buyerName: "王同学",
    sellerName: "张同学",
    status: "pending",
    viewerRole: "buyer",
    createdAt: "2026-04-18 12:45",
    meetingTime: "2026-04-21 · 10:00 - 11:00",
    meetingLocation: "荔园 3 栋楼下",
    note: "买家已下单，当前只需等待卖家 Accept。",
  },
  {
    id: "ord-2004",
    itemId: "11",
    itemTitle: "哑铃一对 5kg×2",
    itemEmoji: "🏋️",
    itemGradient: "from-stone-400 to-stone-600",
    price: 55,
    buyerName: "陈同学",
    sellerName: "钱同学",
    status: "completed",
    viewerRole: "seller",
    createdAt: "2026-04-15 08:20",
    meetingTime: "2026-04-16 · 16:00 - 17:00",
    meetingLocation: "体育馆西门",
    note: "订单已完成，详情页不再显示额外操作按钮。",
  },
];

export function getOrderById(id: string) {
  return mockOrders.find((order) => order.id === id) ?? null;
}

export function getOrderStatusMeta(status: OrderStatus) {
  switch (status) {
    case "pending":
      return {
        label: "待处理",
        className: "bg-amber-100 text-amber-700",
      };
    case "confirmed":
      return {
        label: "待收货",
        className: "bg-blue-100 text-blue-700",
      };
    case "completed":
      return {
        label: "已完成",
        className: "bg-emerald-100 text-emerald-700",
      };
    case "cancelled":
      return {
        label: "已取消",
        className: "bg-muted text-muted-foreground",
      };
  }
}

export function getViewerRoleMeta(role: OrderViewerRole) {
  return role === "buyer"
    ? {
        label: "买家视角",
        counterpartLabel: "卖家",
      }
    : {
        label: "卖家视角",
        counterpartLabel: "买家",
      };
}

export function getOrderPrimaryAction(
  status: OrderStatus,
  viewerRole: OrderViewerRole
) {
  if (viewerRole === "seller" && status === "pending") {
    return {
      key: "accept" as const,
      label: "Accept",
      description: "卖家接受订单后，订单进入待买家确认收货阶段。",
    };
  }

  if (viewerRole === "buyer" && status === "confirmed") {
    return {
      key: "confirm_receipt" as const,
      label: "Confirm Receipt",
      description: "买家确认收货后，订单会被标记为已完成。",
    };
  }

  return null;
}
