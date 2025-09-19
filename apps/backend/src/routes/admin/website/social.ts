import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as SocialController from "@/controllers/admin/website/social";
import { isAdminVerified } from "@/middlewares/admin";

export const adminSocialRouter = Router();

adminSocialRouter.get(
  "/",
  isAdminVerified,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return SocialController.fetchSocials(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
