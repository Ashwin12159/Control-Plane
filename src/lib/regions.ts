export interface RegionConfig {
  code: string;
  name: string;
  grpcHost: string;
  grpcPort: number;
}

export const REGIONS: RegionConfig[] = [
  {
    code: "AU",
    name: "Australia",
    grpcHost: process.env.GRPC_AU_HOST || "localhost",
    grpcPort: parseInt(process.env.GRPC_AU_PORT || "50051", 10),
  },
  {
    code: "US",
    name: "United States",
    grpcHost: process.env.GRPC_US_HOST || "localhost",
    grpcPort: parseInt(process.env.GRPC_US_PORT || "50052", 10),
  },
  {
    code: "UK",
    name: "United Kingdom",
    grpcHost: process.env.GRPC_UK_HOST || "localhost",
    grpcPort: parseInt(process.env.GRPC_UK_PORT || "50053", 10),
  },
];

export function getRegionConfig(code: string): RegionConfig | undefined {
  return REGIONS.find((r) => r.code === code);
}

export function isValidRegion(code: string): boolean {
  return REGIONS.some((r) => r.code === code);
}

