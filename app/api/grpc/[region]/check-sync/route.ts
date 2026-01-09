import { NextRequest, NextResponse } from "next/server";
import { getGrpcClient, grpcCall } from "@/lib/grpc-client";
import { isValidRegion } from "@/lib/regions";
import type { CheckSyncRequest, CheckSyncResponse } from "@/types/grpc";

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
    const { checkType } = body;

    if (!checkType) {
      return NextResponse.json(
        { error: "checkType is required" },
        { status: 400 }
      );
    }

    const client = getGrpcClient(region);
    // Convert camelCase to snake_case for proto oneof
    const grpcRequest: any = {};
    if (checkType.device) {
      grpcRequest.device = {
        deviceMake: checkType.device.deviceMake,
        sipAccount: checkType.device.sipAccount,
      };
    } else if (checkType.location) {
      grpcRequest.location = {
        locationId: checkType.location.locationId,
      };
    } else if (checkType.practice) {
      grpcRequest.practice = {
        practiceId: checkType.practice.practiceId,
      };
    } else if (checkType.allBifrost) {
      grpcRequest.allBifrost = {
        confirm: checkType.allBifrost.confirm,
      };
    }

    const response = await grpcCall<any, CheckSyncResponse>(
      client,
      "CheckSync",
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
