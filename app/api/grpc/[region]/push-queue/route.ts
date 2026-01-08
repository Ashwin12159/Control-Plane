import { NextRequest, NextResponse } from "next/server";
import { getGrpcClient, grpcCall } from "@/lib/grpc-client";
import { isValidRegion } from "@/lib/regions";
import type { PushToRabbitMQQueueRequest, PushToRabbitMQResponse } from "@/types/grpc";

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
    const { queueName, payloadJson } = body;

    if (!queueName || !payloadJson) {
      return NextResponse.json(
        { error: "queueName and payloadJson are required" },
        { status: 400 }
      );
    }

    const client = getGrpcClient(region);
    // Convert camelCase to snake_case for proto
    const grpcRequest: any = {
      queue_name: queueName,
      payload_json: typeof payloadJson === "string" ? payloadJson : JSON.stringify(payloadJson),
    };

    const response = await grpcCall<any, PushToRabbitMQResponse>(
      client,
      "PushToRabbitMQQueue",
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
