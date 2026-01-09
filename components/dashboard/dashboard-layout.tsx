"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

const RegionContext = createContext<{
  region: string;
  setRegion: (region: string) => void;
}>({
  region: "AU-VOICESTACK",
  setRegion: () => {},
});

export function useRegion() {
  return useContext(RegionContext);
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [region, setRegionState] = useState("AU-VOICESTACK");

  useEffect(() => {
    // Load region from localStorage or default to AU-VOICESTACK
    const savedRegion = localStorage.getItem("selectedRegion");
    if (savedRegion) {
      setRegionState(savedRegion);
    }
  }, []);

  const setRegion = (newRegion: string) => {
    setRegionState(newRegion);
    localStorage.setItem("selectedRegion", newRegion);
  };

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header region={region} onRegionChange={setRegion} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <RegionContext.Provider value={{ region, setRegion }}>
              {children}
            </RegionContext.Provider>
          </div>
        </main>
      </div>
    </div>
  );
}

