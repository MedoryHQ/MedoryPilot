import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as footerController from "@/controllers/admin/website/footer";
import { isAdminVerified } from "@/middlewares/admin";
import {
  createFooterValidation,
  deleteFooterValidation,
  updateFooterValidation,
} from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminFooterRouter = Router();

adminFooterRouter.get(
  "/",
  isAdminVerified,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return footerController.fetchFooter(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminFooterRouter.delete(
  "/:id",
  isAdminVerified,
  deleteFooterValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return footerController.deleteFooter(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminFooterRouter.post(
  "/",
  isAdminVerified,
  createFooterValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return footerController.createFooter(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminFooterRouter.put(
  "/:id",
  isAdminVerified,
  updateFooterValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return footerController.updateFooter(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
