"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { RegionSelector } from "./region-selector";
import { LogOut } from "lucide-react";

interface HeaderProps {
  region: string;
  onRegionChange: (region: string) => void;
}

export function Header({ region, onRegionChange }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-6">
      <div className="flex items-center gap-4">
        <RegionSelector value={region} onValueChange={onRegionChange} />
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </header>
  );
}

