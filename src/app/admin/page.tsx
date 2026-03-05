"use client";

import Link from "next/link";
import { 
  Users, 
  Package, 
  Flag, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity,
  AlertCircle
} from "lucide-react";

// 模拟仪表盘数据
const stats = [
  { 
    label: "总用户数", 
    value: "2,543", 
    change: "+12%", 
    trend: "up", 
    icon: Users, 
    color: "text-blue-600", 
    bg: "bg-blue-100" 
  },
  { 
    label: "在线商品", 
    value: "856", 
    change: "+5%", 
    trend: "up", 
    icon: Package, 
    color: "text-purple-600", 
    bg: "bg-purple-100" 
  },
  { 
    label: "待处理举报", 
    value: "12", 
    change: "+2", 
    trend: "up", // 举报增加通常是坏事，用红色表示
    icon: Flag, 
    color: "text-red-600", 
    bg: "bg-red-100" 
  },
  { 
    label: "今日成交", 
    value: "48", 
    change: "-3%", 
    trend: "down", 
    icon: ShoppingBag, 
    color: "text-green-600", 
    bg: "bg-green-100" 
  },
];

const recentActivities = [
  { id: 1, user: "小明", action: "发布了新商品", target: "线性代数教材（同济版）", time: "5分钟前" },
  { id: 2, user: "系统安全", action: "自动拦截了", target: "疑似广告帖", time: "12分钟前" },
  { id: 3, user: "李华", action: "举报了用户", target: "Spammer_007", time: "30分钟前" },
  { id: 4, user: "张伟", action: "完成了订单", target: "罗技 G304 鼠标", time: "1小时前" },
  { id: 5, user: "王五", action: "注册了新账号", target: "", time: "2小时前" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 顶部欢迎语 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">管理后台概览</h1>
          <p className="text-muted-foreground">欢迎回来，管理员。这里是今日的平台数据概况。</p>
        </div>
        <div className="hidden md:block">
           <span className="text-sm bg-muted px-3 py-1 rounded-full text-muted-foreground">
             系统状态: 🟢 正常运行中
           </span>
        </div>
      </div>

      {/* 数据卡片网格 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          // 简单的逻辑判断趋势颜色
          const isPositive = stat.trend === 'up';
          const trendColor = stat.label === "待处理举报" 
            ? (isPositive ? "text-red-600" : "text-green-600") // 举报增加是坏事
            : (isPositive ? "text-green-600" : "text-red-600"); // 其他增加是好事

          return (
            <div key={index} className="p-6 bg-card rounded-xl border shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="text-2xl font-bold">{stat.value}</h2>
                  <span className={`text-xs font-medium flex items-center ${trendColor}`}>
                    {stat.change}
                    {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* 左侧：快捷操作与系统通知 */}
        <div className="col-span-4 space-y-4">
           {/* 待处理事项提醒 */}
           <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 items-start">
              <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-red-900">需要关注</h3>
                <p className="text-sm text-red-700 mt-1">
                  目前有 <span className="font-bold">12</span> 条新的举报信息需要处理，其中 3 条被标记为“高风险诈骗”。
                </p>
                <Link href="/admin/reports">
                  <button className="mt-2 text-xs font-semibold bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors">
                    立即处理
                  </button>
                </Link>
              </div>
           </div>

           {/* 趋势图表占位符 */}
           <div className="bg-card rounded-xl border shadow-sm p-6 h-[300px] flex flex-col">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Activity size={18} />
                流量趋势 (近7天)
              </h3>
              <div className="flex-1 bg-muted/20 rounded-lg flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed gap-2">
                <Activity size={32} className="opacity-20" />
                <span className="text-sm">图表组件区域</span>
                <span className="text-xs opacity-50">(接入 Recharts 或 Chart.js 后显示)</span>
              </div>
           </div>
        </div>

        {/* 右侧：最新动态 Feed */}
        <div className="col-span-3 bg-card rounded-xl border shadow-sm p-6 h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">最新动态</h3>
            <button className="text-xs text-blue-600 hover:underline">刷新</button>
          </div>
          <div className="relative border-l border-muted ml-2 space-y-6">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="ml-6 relative">
                <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-background bg-blue-500 ring-4 ring-background" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">{activity.user}</span> 
                    <span className="text-muted-foreground mx-1">{activity.action}</span> 
                    <span className="font-medium text-foreground">{activity.target}</span>
                  </p>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}