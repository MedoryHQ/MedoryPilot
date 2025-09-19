import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as pageComponentController from "@/controllers/customer/website/page-component";
import { fetchPageComponentValidation } from "@/validations/customer";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const pageComponentRouter = Router();

pageComponentRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return pageComponentController.fetchPageComponents(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

pageComponentRouter.get(
  "/:slug",
  fetchPageComponentValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return pageComponentController.fetchPageComponent(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
