import { getEnvVariable } from "../config/env";
import { cookieOptionsTypes } from "../types/global";

export const GLOBAL_ERROR_MESSAGE = "Something went wrong";

export const cookieOptions: cookieOptionsTypes = {
  httpOnly: true,
  secure: getEnvVariable("nodeEnv") === "production",
  sameSite: getEnvVariable("nodeEnv") === "production" ? "none" : "lax",
  domain:
    getEnvVariable("nodeEnv") === "production"
      ? getEnvVariable("COOKIE_DOMAIN")
      : undefined,
  path: "/",
};
