import { NextRequest, NextResponse } from "next/server";
import { getGrpcClient, grpcCall } from "@/lib/grpc-client";
import { isValidRegion } from "@/lib/regions";
import type { PushToRabbitMQQueueRequest, PushToRabbitMQResponse } from "@/types/grpc";
import { getUserDetails } from "@/lib/utils";
import { AuditLog } from "@/lib/database/entities/AuditLog";
import { getDataSource } from "@/lib/database/data-source";
import { AUDIT_LOG_ACTIONS } from "@/lib/constants";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ region: string }> }
) {
  try {
    const { region } = await params;
    // get user details
    const userDetails = await getUserDetails();

    if (!isValidRegion(region)) {
      return NextResponse.json(
        { error: `Invalid region: ${region}` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { queueName, payloadJson } = body;

    if (!queueName || !payloadJson) {
      return NextResponse.json(
        { error: "queueName and payloadJson are required" },
        { status: 400 }
      );
    }

    const client = getGrpcClient(region);
    console.log({queueName, payloadJson, client});
    const { email } = userDetails;
    const auditLog: AuditLog = {
      region: region as string,
      payload: JSON.stringify({ region, queueName, payloadJson }),
      action: AUDIT_LOG_ACTIONS.PUSH_QUEUE,
      doneBy: email,
    };
    const db = await getDataSource();
    const auditLogRepository = db.getRepository(AuditLog);
    await auditLogRepository.save(auditLog);
    // Convert camelCase to snake_case for proto
    const grpcRequest: any = {
      queueName: queueName,
      payloadJson: typeof payloadJson === "string" ? payloadJson : JSON.stringify(payloadJson),
    };

    const response = await grpcCall<any, PushToRabbitMQResponse>(
      client,
      "PushToRabbitMQQueue",
      grpcRequest
    );
console.log({response});
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
