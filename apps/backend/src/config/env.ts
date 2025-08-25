import { config } from "dotenv";
import { z } from "zod";

config();
const envSchema = z.object({
  // Server
  PORT: z.string().default("8080"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT Secrets
  ADMIN_JWT_ACCESS_SECRET: z.string().min(32),
  ADMIN_JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  // URLs
  CLIENT_URL: z.string().url(),
  ADMIN_URL: z.string().url(),
  SERVER_URL: z.string().url(),
  RESPONSE_URL: z.string().url(),
  COOKIE_DOMAIN: z.string(),

  // SMS
  SMS_MOCK: z.string().default("false"),
  SMS_FAIL_GRACEFULLY: z.string().default("false"),
  SENDER_API_KEY: z.string().min(1),

  // Seeds
  SALT_ROUNDS: z.string(),
  ADMIN_PASSWORD: z.string(),
  EMAIL: z.string().email(),
  ADMIN_FIRST_NAME: z.string(),
  ADMIN_LAST_NAME: z.string(),

  // Email
  SENDGRID_API_KEY: z.string().min(1),

  // Swagger
  SWAGGER_USERNAME: z.string().min(1),
  SWAGGER_PASSWORD: z.string().min(1),

  // logging
  LOG_LEVEL: z.string().default("info"),
  IP_HASH_SECRET: z.string().min(32),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.success ? null : parsed.error.format()
  );
  process.exit(1);
}

export const env = parsed.data;

export function getEnvVariable<Key extends keyof typeof env>(
  key: Key
): (typeof env)[Key] {
  return env[key];
}
