import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from the .env file
dotenv.config({ path: path.resolve(__dirname, ".env.local") });


// Log the DATABASE_URL to verify it's being loaded correctly
console.log('Database URL:', process.env.DATABASE_URL);

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Ensure this is not undefined
  },
});
