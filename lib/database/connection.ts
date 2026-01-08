import { AppDataSource } from "./data-source";

let isInitialized = false;

export async function getDatabaseConnection() {
  if (!isInitialized) {
    if (!AppDataSource.isInitialized) {
      try {
        await AppDataSource.initialize();
      } catch (error) {
        // If initialization fails, log but don't crash
        console.error("Database initialization error:", error);
        throw error;
      }
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
  } catch (error) {
    console.error("Database operation error:", error);
    throw error;
  }
  // Don't close connection in Next.js - keep it alive
}