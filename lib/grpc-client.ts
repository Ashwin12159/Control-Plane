import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import { getRegionConfig } from "./regions";
import type {
  PushToRabbitMQQueueRequest,
  PushToRabbitMQResponse,
  CheckSyncRequest,
  CheckSyncResponse,
  GetNumbersNotInBifrostRequest,
  GetNumbersNotInBifrostResponse,
  GetNumbersNotInNumberCacheRequest,
  GetNumbersNotInNumberCacheResponse,
} from "@/types/grpc";

const PROTO_PATH = path.join(process.cwd(), "proto", "ops.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false, // Convert snake_case to camelCase for TypeScript
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

interface OperationsServiceClient extends grpc.Client {
  PushToRabbitMQQueue: (
    request: PushToRabbitMQQueueRequest,
    callback: (error: grpc.ServiceError | null, response: PushToRabbitMQResponse) => void
  ) => void;
  CheckSync: (
    request: CheckSyncRequest,
    callback: (error: grpc.ServiceError | null, response: CheckSyncResponse) => void
  ) => void;
  GetNumbersNotInBifrost: (
    request: GetNumbersNotInBifrostRequest,
    callback: (error: grpc.ServiceError | null, response: GetNumbersNotInBifrostResponse) => void
  ) => void;
  GetNumbersNotInNumberCache: (
    request: GetNumbersNotInNumberCacheRequest,
    callback: (error: grpc.ServiceError | null, response: GetNumbersNotInNumberCacheResponse) => void
  ) => void;
}

export function getGrpcClient(regionCode: string): OperationsServiceClient {
  const regionConfig = getRegionConfig(regionCode);
  
  if (!regionConfig) {
    throw new Error(`Invalid region code: ${regionCode}`);
  }

  const opsProto = grpc.loadPackageDefinition(packageDefinition) as any;
  const ServiceClient = opsProto.ops.OperationsService as grpc.ServiceClientConstructor;
  
  const client = new ServiceClient(
    `${regionConfig.grpcHost}:${regionConfig.grpcPort}`,
    grpc.credentials.createInsecure()
  ) as unknown as OperationsServiceClient;

  return client;
}

export function grpcCall<TRequest, TResponse>(
  client: OperationsServiceClient,
  method: keyof OperationsServiceClient,
  request: TRequest
): Promise<TResponse> {
  return new Promise((resolve, reject) => {
  (client[method] as (request: TRequest, callback: (error: grpc.ServiceError | null, response: TResponse) => void) => void)(request as TRequest, (error: grpc.ServiceError | null, response: TResponse) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(response as TResponse);
  });
});
}
