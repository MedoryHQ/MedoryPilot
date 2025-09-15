import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as introduceController from "@/controllers/customer/website/introduce";

export const introduceRouter = Router();

introduceRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return introduceController.fetchIntroduce(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
