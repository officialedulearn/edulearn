"use client";

import { useActiveAccount } from "thirdweb/react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import Home from "@/components/home/Home";
import { User } from "@/types";

export function LayoutClient({
  children,
  isCollapsed,
}: {
  children: React.ReactNode;
  isCollapsed: boolean;
}) {
  const userAccount = useActiveAccount?.() || null;
  const [user, setUser] = useState<User>({});
  const [showChat, setShowChat] = useState(false);
  
  useEffect(() => {
    if (userAccount?.address) {
      setUser({ address: userAccount.address });
    }
  }, [userAccount]);

  useEffect(() => {
    if (!showChat) {
      document.title = "EduLearn - Learn with AI and Blockchain";
    } 
  }, [showChat]);

  const handleStartChat = () => {
    setShowChat(true);
  };
  
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
