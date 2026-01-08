import { NextResponse } from "next/server";
import { REGIONS } from "@/lib/regions";

export async function GET() {
  // Return regions without sensitive connection details
  const publicRegions = REGIONS.map(({ code, name }) => ({
    code,
    name,
  }));

  return NextResponse.json(publicRegions);
}

