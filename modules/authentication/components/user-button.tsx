"use client";

import { useState } from "react";
import { LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// Define the shape of your User object
interface UserData {
  id: string;
  email: string;
  name: string | null;       
  image: string | null;      
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface UserButtonProps {
  user: UserData;
  onSettings?: () => void;
  size?: "sm" | "md" | "lg";
  showEmail?: boolean;
  showMemberSince?: boolean;
}

// Helper: Get user initials for avatar fallback
const getUserInitials = (name?: string | null, email?: string | null): string => {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "U";
};

// Helper: Format member since date
const formatMemberSince = (date: string | Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

// Avatar sizes configuration
const avatarSizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export default function UserButton({
  user,
  onSettings,
  size = "md",
  showEmail = true,
  showMemberSince = true,
}: UserButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await onSignOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`relative ${avatarSizes[size]} cursor-pointer rounded-full p-0 hover:bg-accent`}
          disabled={isLoading}
        >
          <Avatar className={avatarSizes[size]}>
            <AvatarImage
              src={user.image || ""}
              alt={user.name || "User avatar"}
            />
            <AvatarFallback className="bg-primary text-primary-foreground font-medium">
              {getUserInitials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={user.image || ""}
                  alt={user.name || "User avatar"}
                />
                <AvatarFallback className="bg-primary text-primary-foreground font-medium text-lg">
                  {getUserInitials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.name || "User"}
                </p>
                {showEmail && user.email && (
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
            {showMemberSince && user.createdAt && (
              <p className="text-xs text-muted-foreground">
                Member since {formatMemberSince(user.createdAt)}
              </p>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {onSettings && (
          <DropdownMenuItem onClick={onSettings} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoading}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoading ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}