import { getEnvVariable } from "@/config";
import { cookieOptionsTypes } from "@/types/global";

export const GLOBAL_ERROR_MESSAGE = "Something went wrong";
const isProduction = getEnvVariable("NODE_ENV") === "production";

export const cookieOptions: cookieOptionsTypes = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "lax",
  domain: isProduction ? getEnvVariable("COOKIE_DOMAIN") : undefined,
  path: "/",
};
