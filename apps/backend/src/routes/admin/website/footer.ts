import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as footerController from "@/controllers/admin/website/footer";
import { isAdminVerified } from "@/middlewares/admin";

export const adminFooterRouter = Router();

adminFooterRouter.get(
  "/",
  isAdminVerified,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return footerController.fetchFooter(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
