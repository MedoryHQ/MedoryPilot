import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as heroController from "@/controllers/customer/website/hero";

export const heroRouter = Router();

heroRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    return heroController.fetchHero(req, res, next);
  } catch {
    res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
  }
});
