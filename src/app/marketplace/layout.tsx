import { AppShell } from "@/components/layout/app-shell";
import type { ReactNode } from "react";

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
