import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";

// Load environment variables (for non-Next.js contexts like CLI)
if (typeof window === "undefined" && !process.env.NEXT_RUNTIME) {
  try {
    const { config } = require("dotenv");
    config();
  } catch (e) {
    // dotenv not available or already loaded
  }
}
// Error [TypeError]: Cannot read properties of undefined (reading 'type')
// at module evaluation (lib/database/data-source.ts:15:30)
// at module evaluation (lib/database/init-db.ts:1:1)
let dataSource: DataSource | null = null;

export const getDataSource = async () => {
  dataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_DATABASE || process.env.DB_NAME || "control_plane",
    entities: [User],
    synchronize: false,
    logging: process.env.NODE_ENV === "development",
  });
  
  if (dataSource && dataSource.isInitialized) {
    console.log("DataSource is initialized");
    return dataSource;
  }
  await dataSource.initialize();
  return dataSource;
};
