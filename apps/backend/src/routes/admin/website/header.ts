import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as headerController from "@/controllers/admin/website/header";
import { isAdminVerified } from "@/middlewares/admin";

export const adminHeaderRouter = Router();

adminHeaderRouter.get(
  "/",
  isAdminVerified,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return headerController.fetchHeaders(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
