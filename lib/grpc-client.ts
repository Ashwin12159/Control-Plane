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
  GenerateSignedURLRequest,
  GenerateSignedURLResponse,
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
  GenerateSignedURL: (
    request: GenerateSignedURLRequest,
    callback: (error: grpc.ServiceError | null, response: GenerateSignedURLResponse) => void
  ) => void;
}

function createMetadata(regionCode: string): grpc.Metadata {
  const metadata = new grpc.Metadata();
  metadata.set("x-region", regionCode);
  
  // Generate token variable name: AUTH_TOKEN_{REGION_CODE} with dashes replaced by underscores
  const tokenVariableName = `AUTH_TOKEN_${regionCode.toUpperCase().replace(/-/g, "_")}`;
  const token = process.env[tokenVariableName];
  
  if (token) {
    metadata.set("authorization", `Bearer ${token}`);
  } else {
    console.warn(`Warning: AUTH_TOKEN environment variable ${tokenVariableName} is not set`);
  }
  
  return metadata;
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

  // Store region code and metadata creator on the client for use in grpcCall
  (client as any).__regionCode = regionCode;
  (client as any).__createMetadata = () => createMetadata(regionCode);

  return client;
}

export function grpcCall<TRequest, TResponse>(
  client: OperationsServiceClient,
  method: keyof OperationsServiceClient,
  request: TRequest
): Promise<TResponse> {
  return new Promise((resolve, reject) => {
    // Get metadata with x-region and authorization headers
    const metadata = (client as any).__createMetadata
      ? (client as any).__createMetadata()
      : new grpc.Metadata();

    const methodCall = client[method] as any;
    const methodName = method as string;
    
    // Get method definition from the service
    const service = (client.constructor as any).service;
    const methodDefinition = service[methodName];
    
    if (!methodDefinition) {
      reject(new Error(`Method ${methodName} not found in service`));
      return;
    }

    client.makeUnaryRequest(
      methodDefinition.path,
      methodDefinition.requestSerialize,
      methodDefinition.responseDeserialize,
      request,
      metadata,
      {}, // options
      (error: grpc.ServiceError | null, response?: TResponse) => {
        if (error) {
          reject(error);
          return;
        }
        if (response === undefined) {
          reject(new Error("No response received from gRPC call"));
          return;
        }
        resolve(response);
      }
    );
  });
}
