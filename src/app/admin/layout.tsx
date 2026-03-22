"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Users, Package, Flag, Gavel, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";
import { toast } from "sonner";

const adminNavItems = [
  { href: "/admin", label: "仪表盘", icon: Shield },
  { href: "/admin/users", label: "用户管理", icon: Users },
  { href: "/admin/items", label: "商品管理", icon: Package },
  { href: "/admin/reports", label: "举报处理", icon: Flag },
  { href: "/admin/orders", label: "订单仲裁", icon: Gavel },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isHydrating } = useAuthStore();

  useEffect(() => {
    if (isHydrating) return;
    if (!isAuthenticated) {
      toast.error("请先登录管理员账号");
      router.replace("/login?redirect=/admin");
      return;
    }
    if (user?.role !== "ADMIN") {
      toast.error("无权访问管理后台");
      router.replace("/marketplace");
    }
  }, [isHydrating, isAuthenticated, user, router]);

  if (isHydrating) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">验证权限中…</div>;
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">正在跳转…</div>;
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col fixed inset-y-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 font-bold text-lg tracking-wider">
          <Shield className="mr-2 h-6 w-6 text-red-500" />
          ADMIN CENTER
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
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
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{user.username}</p>
              <p className="text-xs text-slate-400">管理员</p>
            </div>
          </div>
          <Link href="/marketplace">
            <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30">
              <LogOut className="mr-2 h-4 w-4" /> 退出管理
            </Button>
          </Link>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
