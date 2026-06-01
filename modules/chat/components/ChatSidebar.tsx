"use client";

import { useState, useMemo, Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusIcon,
  SearchIcon,
  MenuIcon,
  EllipsisIcon,
  Trash,
} from "lucide-react";
import { isToday, isYesterday, isWithinInterval, subDays } from "date-fns";
import UserButton, { UserData } from "../../authentication/components/user-button";

function ChatSidebar({user}:{user:UserData}) {
  const [searchQuery, setSearchQuery] = useState("")


  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
       
      {/* Header */}
      <div className="flex h-12 items-center justify-center border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Image src={"/logo2.svg"} alt="Logo" width={100} height={21} className="h-auto" loading="eager" />
        </div>
      </div>

      {/* New Chat BUtton */}
      <div className="p-4">
        <Link href={"/"}>
          <Button className={"w-full"}>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search your chat..."
            className={"pl-9 bg-sidebar-accent border-sidebar-b pr-8"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={(e) => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>

      </div>

      {/* Filtered Chats */}
      <div className="flex-1 overflow-y-auto px-2">
        {/*
          filteredChats.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              {searchQuery ? "No Chats Founds" : "No Chats Yet"}
          </div>
          ) : (
            <>
            {
              groupedChats.today.length > 0 && (
                <div className="mb-4">
                      <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">Today</div>
                      {renderChatList(groupedChats.today)}
                    </div>
              )
            }

              
                  {groupedChats.yesterday.length > 0 && (
                    <div className="mb-4">
                      <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">Yesterday</div>
                      {renderChatList(groupedChats.yesterday)}
                    </div>
                  )}
                  
                  {groupedChats.lastWeek.length > 0 && (
                    <div className="mb-4">
                      <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">Last 7 Days</div>
                      {renderChatList(groupedChats.lastWeek)}
                    </div>
                  )}
                  
                  {groupedChats.older.length > 0 && (
                    <div className="mb-4">
                      <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">Older</div>
                      {renderChatList(groupedChats.older)}
                    </div>
                  )}
            </>
          )
        */}
      </div>
      
      {/* Footer */}
      <div className="p-4 flex items-center gap-3 border-t border-sidebar-border">
        <UserButton user={user} />
        <span className="flex-1 text-sm text-sidebar-foreground truncate">
          {user.name}
        </span>
      </div>

    </div>
  );
}

export default ChatSidebar