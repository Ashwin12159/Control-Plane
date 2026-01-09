"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { REGIONS } from "@/lib/regions";

interface RegionSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function RegionSelector({ value, onValueChange }: RegionSelectorProps) {
  const [selectedRegion, setSelectedRegion] = useState(value || "AU-VOICESTACK");

  useEffect(() => {
    if (value) {
      setSelectedRegion(value);
    }
  }, [value]);

  const handleChange = (newValue: string) => {
    setSelectedRegion(newValue);
    onValueChange(newValue);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-slate-400" />
      <Select value={selectedRegion} onValueChange={handleChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Select Region" />
        </SelectTrigger>
        <SelectContent>
          {REGIONS.map((region) => (
            <SelectItem key={region.code} value={region.code}>
              {region.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

