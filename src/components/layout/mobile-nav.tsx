"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/marketplace", label: "市场", icon: "🏪" },
  { href: "/chat", label: "聊天", icon: "💬" },
  { href: "/map", label: "地图", icon: "🗺️" },
  { href: "/profile", label: "我的", icon: "👤" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t bg-background md:hidden">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors",
            pathname.startsWith(item.href)
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
