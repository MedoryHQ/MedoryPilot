import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as pageComponentController from "@/controllers/admin/website/page-component";
import { isAdminVerified } from "@/middlewares/admin";
import {
  deletePageComponentValidation,
  fetchPageComponentValidation,
} from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminPageComponentRouter = Router();

adminPageComponentRouter.get(
  "/",
  isAdminVerified,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return pageComponentController.fetchPageComponents(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminPageComponentRouter.get(
  "/:slug",
  isAdminVerified,
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

adminPageComponentRouter.delete(
  "/:slug",
  isAdminVerified,
  deletePageComponentValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return pageComponentController.deletePageComponent(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
