import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as AboutController from "@/controllers/admin/website/about";
import { adminAuthenticate } from "@/middlewares/admin";
import {
  createAboutValidation,
  updateAboutValidation,
} from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminAboutRouter = Router();

adminAboutRouter.get(
  "/",
  adminAuthenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return AboutController.fetchAbout(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminAboutRouter.delete(
  "/",
  adminAuthenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return AboutController.deleteAbout(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminAboutRouter.post(
  "/",
  adminAuthenticate,
  createAboutValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return AboutController.createAbout(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
