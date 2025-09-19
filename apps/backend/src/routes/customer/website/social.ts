import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as socialsController from "@/controllers/customer/website/social";

export const socialRouter = Router();

socialRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return socialsController.fetchSocials(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
