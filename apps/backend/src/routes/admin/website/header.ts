import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as headerController from "@/controllers/admin/website/header";
import { isAdminVerified } from "@/middlewares/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";
import {
  createHeaderValidation,
  deleteHeaderValidation,
  updateHeaderValidation,
} from "@/validations/admin";

export const adminHeaderRouter = Router();

adminHeaderRouter.get(
  "/",
  isAdminVerified,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return headerController.fetchHeader(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminHeaderRouter.delete(
  "/:id",
  isAdminVerified,
  deleteHeaderValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return headerController.deleteHeader(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminHeaderRouter.post(
  "/",
  isAdminVerified,
  createHeaderValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return headerController.createHeader(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminHeaderRouter.put(
  "/:id",
  isAdminVerified,
  updateHeaderValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return headerController.updateHeader(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
