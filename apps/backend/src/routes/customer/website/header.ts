import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as headerController from "@/controllers/customer/website/header";

export const headerRouter = Router();

headerRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return headerController.fetchHeader(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
