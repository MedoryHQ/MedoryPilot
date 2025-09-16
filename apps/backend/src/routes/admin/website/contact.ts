import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as ContactController from "@/controllers/admin/website/contact";
import { isAdminVerified } from "@/middlewares/admin";
import { createContactValidation } from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminContactRouter = Router();

adminContactRouter.get(
  "/",
  isAdminVerified,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return ContactController.fetchContact(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminContactRouter.delete(
  "/",
  isAdminVerified,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return ContactController.deleteContact(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminContactRouter.post(
  "/",
  isAdminVerified,
  createContactValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return ContactController.createContact(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
