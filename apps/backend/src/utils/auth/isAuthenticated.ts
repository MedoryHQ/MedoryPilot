import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { getEnvVariable } from "@/config";
import { sendError } from "../helpers";
import { User } from "@/types/global";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.get("authorization")?.split(" ")[1];
    const accessToken = req.cookies.accessToken;

    if (!token && !accessToken) {
      return sendError(req, res, 401, "noTokenProvided");
    }

    const tokenData = token ? token : accessToken;

    const decoded = jwt.verify(
      tokenData,
      getEnvVariable("JWT_ACCESS_SECRET")
    ) as User;

    (req as any).user = decoded;
    next();
  } catch (error) {
    return sendError(req, res, 401, "unauthorized");
  }
};

const isAuthenticatedAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.get("authorization")?.split(" ")[1];
    if (!token) return sendError(req, res, 401, "noTokenProvided");

    const decoded = jwt.verify(
      token,
      getEnvVariable("ADMIN_JWT_REFRESH_SECRET")
    ) as {
      userId: string;
    };

    (req as any).user = decoded;
    next();
  } catch (error) {
    return sendError(req, res, 401, "invalidRefreshToken");
  }
};

export { isAuthenticated, isAuthenticatedAdmin };
