"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Users, Package, Flag, Gavel, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// 左侧导航菜单配置
const adminNavItems = [
  { href: "/admin", label: "仪表盘", icon: Shield }, // 新增仪表盘入口
  { href: "/admin/users", label: "用户管理", icon: Users },
  { href: "/admin/items", label: "商品管理", icon: Package },
  { href: "/admin/reports", label: "举报处理", icon: Flag },
  { href: "/admin/orders", label: "订单仲裁", icon: Gavel },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* --- 左侧黑色侧边栏开始 --- */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col fixed inset-y-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 font-bold text-lg tracking-wider">
          <Shield className="mr-2 h-6 w-6 text-red-500" />
          ADMIN CENTER
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            // 判断当前路径是否匹配，高亮显示
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-red-600 text-white shadow-md"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-medium">管理员</p>
              <p className="text-xs text-slate-400">特殊权限账号</p>
            </div>
          </div>
          <Link href="/login">
            <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30">
              <LogOut className="mr-2 h-4 w-4" /> 退出管理
            </Button>
          </Link>
        </div>
      </aside>
      {/* --- 左侧黑色侧边栏结束 --- */}

      {/* --- 右侧主内容区域 --- */}
      {/* ml-64 (margin-left: 16rem) 是为了给 fixed 的侧边栏留出位置 */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 这里渲染的就是 page.tsx 的内容 */}
          {children}
        </div>
      </main>
    </div>
  );
}