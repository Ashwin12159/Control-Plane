import { NextRequest, NextResponse } from "next/server";
import { getGrpcClient, grpcCall } from "@/lib/grpc-client";
import { isValidRegion } from "@/lib/regions";
import type { GetNumbersNotInBifrostRequest, GetNumbersNotInBifrostResponse } from "@/types/grpc";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ region: string }> }
) {
  try {
    const { region } = await params;
    
    if (!isValidRegion(region)) {
      return NextResponse.json(
        { error: `Invalid region: ${region}` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { trunkSid } = body;

    if (!trunkSid) {
      return NextResponse.json(
        { error: "trunkSid is required" },
        { status: 400 }
      );
    }

    const client = getGrpcClient(region);
    // Convert camelCase to snake_case for proto
    const grpcRequest: any = {
      trunk_sid: trunkSid,
    };

    const response = await grpcCall<any, GetNumbersNotInBifrostResponse>(
      client,
      "GetNumbersNotInBifrost",
      grpcRequest
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("gRPC error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
