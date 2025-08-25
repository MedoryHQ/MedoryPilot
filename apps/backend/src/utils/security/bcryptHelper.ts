import * as bcrypt from "bcrypt";
import crypto from "crypto";
import { getEnvVariable } from "@/config";
import { createHmac } from "crypto";

export const createPassword = async (password: string) => {
  const saltRounds = Number(getEnvVariable("SALT_ROUNDS") || 10);
  const salt = await bcrypt.genSalt(saltRounds);
  const passwordHash = await bcrypt.hash(password, salt);
  return passwordHash;
};

export const generateSmsCode = async () => {
  const nodeEnv = getEnvVariable("NODE_ENV");
  const code =
    nodeEnv === "test" || nodeEnv === "development"
      ? "1234"
      : crypto.randomInt(1000, 10000).toString().padStart(6, "0");
  const saltRounds = Number(getEnvVariable("SALT_ROUNDS") || 10);
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedSmsCode = await bcrypt.hash(code, salt);

  return { smsCode: code, hashedSmsCode };
};

export const verifyField = async (plainField: string, hashedField: string) => {
  return bcrypt.compare(plainField, hashedField);
};

export function hashIp(ip: string): string {
  const key = getEnvVariable("IP_HASH_SECRET");

  const normalized = String(ip).trim();

  return createHmac("sha256", key).update(normalized).digest("hex");
}
