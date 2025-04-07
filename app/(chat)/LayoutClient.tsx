"use client";

import { useActiveAccount } from "thirdweb/react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import Home from "@/components/home/Home";

export function LayoutClient({
  children,
  isCollapsed,
}: {
  children: React.ReactNode;
  isCollapsed: boolean;
}) {
  const userAccount = useActiveAccount?.() || null;
  const [user, setUser] = useState<{ address?: string }>({});
  const [showChat, setShowChat] = useState(false);
  
  useEffect(() => {
    if (userAccount?.address) {
      setUser({ address: userAccount.address });
    }
  }, [userAccount]);
  
  // Function to handle chat start
  const handleStartChat = () => {
    setShowChat(true);
  };
  
  // Render logic
  return (
    <>
      {showChat ? (
        <SidebarProvider defaultOpen={!isCollapsed}>
          <AppSidebar user={user} />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      ) : (
        <Home onStartChat={handleStartChat} />
      )}
    </>
  );
}