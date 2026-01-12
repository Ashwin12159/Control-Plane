"use client";

import { RegionSelector } from "./region-selector";
import { UserMenu } from "./user-menu";

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
      <div className="flex items-center">
        <UserMenu />
      </div>
    </header>
  );
}

