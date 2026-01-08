export interface PushQueueRequest {
  queueName: string;
  payload: string;
}

export interface PushQueueResponse {
  success: boolean;
  message: string;
}

export interface CheckSyncRequest {
  syncType: string;
  id: string;
}

export interface CheckSyncResponse {
  inSync: boolean;
  message: string;
}

export interface GetNumbersRequest {
  trunkSid: string;
}

export interface NumberInfo {
  number: string;
  trunkSid: string;
  status: string;
  createdAt: number;
}

export interface GetNumbersResponse {
  numbers: NumberInfo[];
}

