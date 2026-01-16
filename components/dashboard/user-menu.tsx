"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Mail, Badge } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROLES } from "@/lib/permissions";

export function UserMenu() {
  const { data: session, status } = useSession();

  // Show loading state while session is being fetched
  if (status === "loading") {
    return (
      <Button
        variant="ghost"
        className="flex items-center gap-2 h-auto py-2 px-3"
        disabled
      >
        <div className="h-8 w-8 rounded-full bg-slate-800 animate-pulse" />
        <div className="flex flex-col items-start text-left">
          <div className="h-4 w-20 bg-slate-800 rounded animate-pulse" />
        </div>
      </Button>
    );
  }

  const user = session?.user;
  
  // Debug: Log session to help troubleshoot
  if (process.env.NODE_ENV === "development") {
    console.log("Session data:", session);
    console.log("User data:", user);
  }
  
  const username = user?.name || (user as any)?.username || "User";
  const email = user?.email || "";
  const role = (user as any)?.role || null;
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;

  const permissions = (user as any)?.permissions || [];
  const initials = username
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-auto py-2 px-3 hover:bg-slate-800 transition-all duration-200"
        >
          <Avatar className="h-8 w-8 bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-cyan-400/50">
            <AvatarFallback className="text-xs font-semibold text-white bg-gradient-to-br from-cyan-500 to-blue-600">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{username}</span>
              {role && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isSuperAdmin
                      ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30"
                      : "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30"
                  }`}
                >
                  {isSuperAdmin ? "Super Admin" : "User"}
                </span>
              )}
            </div>
            {email && (
              <span className="text-xs text-slate-400">{email}</span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" />
            <span className="text-white">{username}</span>
            {role && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isSuperAdmin
                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30"
                    : "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30"
                }`}
              >
                {isSuperAdmin ? "Super Admin" : "User"}
              </span>
            )}
          </div>
          {email && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Mail className="h-3 w-3" />
              <span>{email}</span>
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-800" />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-red-400 hover:text-red-300 hover:bg-slate-800 focus:bg-slate-800 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
