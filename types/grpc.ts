// RabbitMQ Types
export interface PushToRabbitMQQueueRequest {
  queueName: string;
  payloadJson: string;
}

export interface PushToRabbitMQResponse {
  success: boolean;
  message: string;
  queueOrExchange?: string;
}

// Check Sync Types
export interface CheckSyncRequest {
  checkType: {
    device?: CheckSyncDevice;
    location?: CheckSyncLocation;
    practice?: CheckSyncPractice;
    allBifrost?: CheckSyncAllBifrost;
  };
}

export interface CheckSyncDevice {
  deviceMake: string; // "Yealink" or "Polycom"
  sipAccount: string;
}

export interface CheckSyncLocation {
  locationId: string;
}

export interface CheckSyncPractice {
  practiceId: string;
}

export interface CheckSyncAllBifrost {
  confirm: boolean;
}

export interface CheckSyncResponse {
  success: boolean;
  message: string;
  results: SyncResult[];
}

export interface SyncResult {
  identifier: string; // Device SIP, Location ID, or Practice ID
  inSync: boolean;
  details: string;
}

// Numbers Not In Bifrost Types
export interface GetNumbersNotInBifrostRequest {
  trunkSid: string;
}

export interface GetNumbersNotInBifrostResponse {
  success: boolean;
  message: string;
  practiceNumbers: Record<string, PhoneNumberList>;
}

export interface PhoneNumberList {
  phoneNumbers: string[];
}

// Numbers Not In Number Cache Types
export interface GetNumbersNotInNumberCacheRequest {
  // No parameters needed - checks all Bifrost practices
}

export interface GetNumbersNotInNumberCacheResponse {
  success: boolean;
  message: string;
  practiceNumbers: Record<string, PhoneNumberList>;
}

// Generate Signed URL Types
export interface GenerateSignedURLRequest {
  url: string;
}

export interface GenerateSignedURLResponse {
  success: boolean;
  message: string;
  signedUrl: string;
  expiresIn: number; // Expiry time in seconds
}

// Legacy types for backward compatibility (deprecated - use new types above)
export interface PushQueueRequest {
  queueName: string;
  payload: string;
}

export interface PushQueueResponse {
  success: boolean;
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
