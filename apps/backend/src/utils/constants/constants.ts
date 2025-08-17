import { getEnvVariable } from "@/config";
import { cookieOptionsTypes } from "@/types/global";

export const GLOBAL_ERROR_MESSAGE = "Something went wrong";

export const cookieOptions: cookieOptionsTypes = {
  httpOnly: true,
  secure: getEnvVariable("NODE_ENV") === "production",
  sameSite: getEnvVariable("NODE_ENV") === "production" ? "none" : "lax",
  domain:
    getEnvVariable("NODE_ENV") === "production"
      ? getEnvVariable("COOKIE_DOMAIN")
      : undefined,
  path: "/",
};
