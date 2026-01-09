import { NextRequest, NextResponse } from "next/server";
import { getGrpcClient, grpcCall } from "@/lib/grpc-client";
import { isValidRegion } from "@/lib/regions";
import type { GetNumbersNotInNumberCacheRequest, GetNumbersNotInNumberCacheResponse } from "@/types/grpc";

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

    const client = getGrpcClient(region);
    // Empty request - no parameters needed
    const grpcRequest: any = {};

    const response = await grpcCall<any, GetNumbersNotInNumberCacheResponse>(
      client,
      "GetNumbersNotInNumberCache",
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

