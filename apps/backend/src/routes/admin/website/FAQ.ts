import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as FAQController from "@/controllers/admin/website/FAQ";
import { isAdminVerified } from "@/middlewares/admin";
import {
  createFAQValidation,
  deleteFAQValidation,
  fetchFAQValidation,
  updateFAQValidation,
} from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminFAQRouter = Router();

adminFAQRouter.get(
  "/",
  isAdminVerified,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return FAQController.fetchFAQs(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminFAQRouter.get(
  "/:id",
  isAdminVerified,
  fetchFAQValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return FAQController.fetchFAQ(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminFAQRouter.delete(
  "/:id",
  isAdminVerified,
  deleteFAQValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return FAQController.deleteFAQ(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminFAQRouter.post(
  "/",
  isAdminVerified,
  createFAQValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return FAQController.createFAQ(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminFAQRouter.put(
  "/:id",
  isAdminVerified,
  updateFAQValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return FAQController.updateFAQ(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
