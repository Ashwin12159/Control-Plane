import { AppDataSource } from "./data-source";

let isInitialized = false;

export async function getDatabaseConnection() {
  if (!isInitialized) {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    isInitialized = true;
  }
  return AppDataSource;
}

// For Next.js API routes
export async function withDatabase<T>(
  callback: (dataSource: typeof AppDataSource) => Promise<T>
): Promise<T> {
  const dataSource = await getDatabaseConnection();
  try {
    return await callback(dataSource);
  } finally {
    // Don't close connection in Next.js - keep it alive
  }
}