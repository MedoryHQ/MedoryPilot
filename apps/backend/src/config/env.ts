import { config } from "dotenv";

config();

const envVariables = {
  adminJwtAccessSecret: process.env.ADMIN_JWT_ACCESS_SECRET,
  adminJwtRefreshSecret: process.env.ADMIN_JWT_REFRESH_SECRET,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  port: process.env.PORT,
  saltRounds: process.env.SALT_ROUNDS,
  dbUrl: process.env.DATABASE_URL,
  adminPassword: process.env.ADMIN_PASSWORD,
  clientUrl: process.env.CLIENT_URL,
  adminUrl: process.env.ADMIN_URL,
  serverUrl: process.env.SERVER_URL,
  nodeEnv: process.env.NODE_ENV,
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  RESPONSE_URL: process.env.RESPONSE_URL,
};

type EnvVariableKey = keyof typeof envVariables;

export const getEnvVariable = (key: EnvVariableKey): string => {
  const value = envVariables[key];

  if (!value) {
    const formattedKey = key.replace(/([A-Z])/g, "_$1").toUpperCase();
    throw new Error(`Env variable ${formattedKey} is not provided`);
  }

  return value;
};
