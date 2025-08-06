import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { getEnvVariable } from "../config/env";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.get("authorization")?.split(" ")[1];
    const accessToken = req.cookies.accessToken;

    if (!token && !accessToken) {
      return res.status(401).json({
        success: false,
        msg: "დასაშვებად გთხოვთ გაიაროთ ავტორიზაცია",
      });
    }
    const tokenData = token ? token : accessToken;

    const decoded = jwt.verify(
      tokenData,
      getEnvVariable("jwtAccessSecret")
    ) as {
      id: string;
      email: string;
    };

    (
      req as unknown as {
        user: {
          id: string;
          email: string;
        };
      }
    ).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      msg: "ავტორიზაციის ტოკენი არასწორია ან ვადაგასულია",
    });
  }
};

const isAuthenticatedAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.get("authorization")?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "არ გაქვთ წვდომა",
      });
    }

    const decoded = jwt.verify(
      token,
      getEnvVariable("adminJwtAccessSecret")
    ) as {
      userId: string;
      role: string;
    };

    if (decoded.role !== "ADMIN" && decoded.role !== "SUPER_ADMIN") {
      return res.status(401).json({
        success: false,
        msg: "არ გაქვთ წვდომა",
      });
    }

    (
      req as unknown as {
        user: {
          userId: string;
          role: string;
        };
      }
    ).user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, msg: (error as { message: string }).message });
  }
};
export { isAuthenticated, isAuthenticatedAdmin };
