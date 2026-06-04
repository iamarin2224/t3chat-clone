"use client";

import React, { useState, useEffect } from "react";
import ChatSidebar from "@/modules/chat/components/ChatSidebar";
import Header from "./header";
import { ChatWithMessages } from "@/modules/chat/components/ChatSidebar";
import { UserData } from "@/modules/authentication/components/user-button";

interface ChatLayoutProps {
  user: UserData;
  initialChats: ChatWithMessages[];
  children: React.ReactNode;
}

export default function ChatLayout({ user, initialChats, children }: ChatLayoutProps) {
  // Sidebar open by default on desktop, closed on mobile
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Avoid hydration layout shift or flash by showing desktop-default open layout initially, 
  // but using simple class styling to manage responsiveness gracefully.
  return (
    <div className="flex h-screen w-screen overflow-hidden relative">
      {/* Backdrop for mobile overlays */}
      {mounted && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Collapsible Sidebar Container */}
      <div
        className={`
          fixed md:relative inset-y-0 left-0 z-50 md:z-auto
          h-full border-r border-border bg-sidebar
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:translate-x-0 md:w-0 overflow-hidden border-r-0"}
        `}
      >
        <div className="w-64 h-full">
          <ChatSidebar user={user} chats={initialChats} onClose={toggleSidebar} />
        </div>
      </div>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isOpen} />
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
