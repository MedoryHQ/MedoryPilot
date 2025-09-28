import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as footerController from "@/controllers/admin/website/footer";
import { adminAuthenticate } from "@/middlewares/admin";
import {
  createFooterValidation,
  deleteFooterValidation,
  updateFooterValidation,
} from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminFooterRouter = Router();

adminFooterRouter.get(
  "/",
  adminAuthenticate,
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
  adminAuthenticate,
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
  adminAuthenticate,
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
  adminAuthenticate,
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
