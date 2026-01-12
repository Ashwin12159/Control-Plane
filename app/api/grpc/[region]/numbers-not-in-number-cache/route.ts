import { NextRequest, NextResponse } from "next/server";
import { getGrpcClient, grpcCall } from "@/lib/grpc-client";
import { isValidRegion } from "@/lib/regions";
import type { GetNumbersNotInNumberCacheRequest, GetNumbersNotInNumberCacheResponse } from "@/types/grpc";
import { getUserDetails } from "@/lib/utils";
import { requirePermissionFromSession, PERMISSIONS } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";
import { AUDIT_LOG_ACTIONS } from "@/lib/constants";

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

    // Check permissions from JWT (faster than DB query)
    const userDetails = await getUserDetails();
    const permissionCheck = requirePermissionFromSession(
      userDetails.permissions,
      userDetails.role,
      PERMISSIONS.NUMBERS_NOT_IN_CACHE
    );
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: 403 }
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

    // Create audit log
    await createAuditLog(
      AUDIT_LOG_ACTIONS.GET_NUMBERS_NOT_IN_CACHE,
      region,
      {}
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

