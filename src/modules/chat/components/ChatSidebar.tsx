"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusIcon,
  SearchIcon,
  EllipsisIcon,
  Trash,
} from "lucide-react";
import { isToday, isYesterday, isWithinInterval, subDays } from "date-fns";
import UserButton, { UserData } from "../../authentication/components/user-button";
import { usePathname } from "next/navigation";
import { Prisma, Chat } from "@/generated/prisma/client";

export type ChatWithMessages = Prisma.ChatGetPayload<{
  include: { messages: true }
}>

interface GroupedChats<T> {
  today: T[];
  yesterday: T[];
  lastWeek: T[];
  older: T[];
}

function groupChatsByDate<T extends Chat | ChatWithMessages>(
  chats: T[]
): GroupedChats<T> {
  const groups: GroupedChats<T> = {
    today: [],
    yesterday: [],
    lastWeek: [],
    older: [],
  };

  const now = new Date();

  chats.forEach((chat) => {
    const date = new Date(chat.createdAt);

    if (isToday(date)) {
      groups.today.push(chat);
    } else if (isYesterday(date)) {
      groups.yesterday.push(chat);
    } else if (
      isWithinInterval(date, { start: subDays(now, 7), end: now })
    ) {
      groups.lastWeek.push(chat);
    } else {
      groups.older.push(chat);
    }
  });

  return groups;
}

// 1. Strictly define the keys here so TypeScript knows they match GroupedChats exactly
const DATE_GROUPS: { key: keyof GroupedChats<any>; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "lastWeek", label: "Last 7 Days" },
  { key: "older", label: "Older" },
];

interface ChatItemProps<T extends Chat | ChatWithMessages> {
  chat: T;
  isActive: boolean;
  onDelete: (e: React.MouseEvent, chatId: string) => void;
}

function ChatItem<T extends Chat | ChatWithMessages>({ 
  chat, 
  isActive, 
  onDelete 
}: ChatItemProps<T>) {
  return (
    <Link
      href={`/chat/${chat.id}`}
      className={cn(
        "flex items-center justify-between rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
        isActive && "bg-sidebar-accent"
      )}
    >
      <span className="truncate flex-1">{chat.title}</span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 hover:bg-sidebar-accent-foreground/10"
            onClick={(e) => e.preventDefault()}
          >
            <EllipsisIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            className="text-red-500 cursor-pointer" 
            onClick={(e) => onDelete(e, chat.id)}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Link>
  );
}

interface ChatGroupProps<T extends Chat | ChatWithMessages> {
  label: string;
  chats: T[];
  activeChatId?: string;
  onDelete: (e: React.MouseEvent, chatId: string) => void;
}

function ChatGroup<T extends Chat | ChatWithMessages>({
  label,
  chats,
  activeChatId,
  onDelete,
}: ChatGroupProps<T>) {
  
  if (chats.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
        {label}
      </div>
      
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

interface ChatSidebarProps {
  user: UserData,
  chats: ChatWithMessages[]
}

function ChatSidebar({user, chats}: ChatSidebarProps) {
  const pathname = usePathname()
  const activeChatId = pathname.startsWith("/chat/") ? pathname.split("/")[2] : undefined
  const [searchQuery, setSearchQuery] = useState("")

  const filteredChats = useMemo(() => {
    if (!searchQuery) return chats

    const query = searchQuery.toLowerCase()
    return chats.filter((chat) => 
      chat.title?.toLowerCase().includes(query) ||
      chat.messages?.some((msg) => msg.content?.toLowerCase().includes(query))
    )
  }, [chats, searchQuery])

  const groupedChats = groupChatsByDate(filteredChats)

  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    // Your delete logic here
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
       
      {/* Header */}
      <div className="flex h-12 items-center justify-center border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Image src={"/logo2.svg"} alt="Logo" width={100} height={21} className="h-auto" loading="eager" />
        </div>
      </div>

      {/* New Chat Button */}
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
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Filtered Chats */}
      <div className="flex-1 overflow-y-auto px-2">
        {
          filteredChats.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              {searchQuery ? "No Chats Found" : "No Chats Yet"}
            </div>
          ) : (
            DATE_GROUPS.map((group) => (
              <ChatGroup
                key={group.key}
                label={group.label}
                chats={groupedChats[group.key]}
                activeChatId={activeChatId}
                onDelete={handleDelete}
              />
            )) 
          )
        }
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

export default ChatSidebar;