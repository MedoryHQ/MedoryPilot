import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  PORT: z.string().default("8080"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("test"),

  DATABASE_URL: z.string().url().default("postgres://localhost/testdb"),

  ADMIN_JWT_ACCESS_SECRET: z.string().default("a".repeat(32)),
  ADMIN_JWT_REFRESH_SECRET: z.string().default("b".repeat(32)),
  JWT_ACCESS_SECRET: z.string().default("c".repeat(32)),
  JWT_REFRESH_SECRET: z.string().default("d".repeat(32)),

  CLIENT_URL: z.string().url().default("http://localhost:3000"),
  ADMIN_URL: z.string().url().default("http://localhost:3001"),
  SERVER_URL: z.string().url().default("http://localhost:8080"),
  RESPONSE_URL: z.string().url().default("http://localhost:8080"),
  COOKIE_DOMAIN: z.string().default("localhost"),

  SMS_MOCK: z.string().default("true"),
  SMS_FAIL_GRACEFULLY: z.string().default("true"),
  SENDER_API_KEY: z.string().default("test_api_key"),

  SALT_ROUNDS: z.string().default("10"),
  ADMIN_PASSWORD: z.string().default("admin1234"),
  EMAIL: z.string().email().default("admin@example.com"),
  ADMIN_FIRST_NAME: z.string().default("Admin"),
  ADMIN_LAST_NAME: z.string().default("User"),

  SENDGRID_API_KEY: z.string().default("sendgrid_test_key"),

  SWAGGER_USERNAME: z.string().default("swagger"),
  SWAGGER_PASSWORD: z.string().default("swagger"),

  LOG_LEVEL: z.string().default("info"),

  IP_HASH_SECRET: z.string().min(32).default("e".repeat(32)),
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
