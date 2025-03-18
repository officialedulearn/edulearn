"use client";

import { useActiveAccount } from "thirdweb/react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

export function LayoutClient({ children, isCollapsed }: { children: React.ReactNode; isCollapsed: boolean }) {
  const userAccount = useActiveAccount();
  const [user, setUser] = useState<{ address?: string }>({});

  useEffect(() => {
    if (userAccount?.address) {
      setUser({ address: userAccount.address });
    }
  }, [userAccount]);

  return (
    <SidebarProvider defaultOpen={!isCollapsed}>
      <AppSidebar user={user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
