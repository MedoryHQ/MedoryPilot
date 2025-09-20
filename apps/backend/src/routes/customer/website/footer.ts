import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as footerController from "@/controllers/customer/website/footer";

export const footerRouter = Router();

footerRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return footerController.fetchFooter(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
