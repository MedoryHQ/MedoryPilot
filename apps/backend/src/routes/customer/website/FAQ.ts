import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as FAQController from "@/controllers/customer/website/FAQ";

export const FAQRouter = Router();

FAQRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    return FAQController.fetchFAQs(req, res, next);
  } catch {
    res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
  }
});
