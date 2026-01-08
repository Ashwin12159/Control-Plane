import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./lib/database/entities/User";
import { config } from "dotenv";

config();
const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "control_plane",
  entities: [User],
  migrations: ["lib/database/migrations/**/*.ts"],
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
});

export default AppDataSource;