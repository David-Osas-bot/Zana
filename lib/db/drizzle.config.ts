import "dotenv/config";  
/// <reference types="node" />
import { defineConfig } from "drizzle-kit";
import fs from "fs";
import path from "path";

// Check common locations for the .env file
const envLocations = [
  path.resolve(__dirname, "../../.env"),
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(process.cwd(), ".env"),
];

for (const envPath of envLocations) {
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    for (const line of envConfig.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...val] = trimmed.split("=");
        if (key && val.length > 0) {
          process.env[key.trim()] = val.join("=").trim().replace(/^["']|["']$/g, "");
        }
      }
    }
    break;
  }
}

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});