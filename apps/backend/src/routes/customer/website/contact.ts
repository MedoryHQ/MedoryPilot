import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as contactController from "@/controllers/customer/website/contact";

export const contactRouter = Router();

contactRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return contactController.fetchContact(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
