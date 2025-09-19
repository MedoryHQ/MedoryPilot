import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as SocialController from "@/controllers/admin/website/social";
import { isAdminVerified } from "@/middlewares/admin";
import {
  createSocialValidation,
  deleteSocialValidation,
  fetchSocialValidation,
  updateSocialValidation,
} from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminSocialRouter = Router();

adminSocialRouter.get(
  "/",
  isAdminVerified,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return SocialController.fetchSocials(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminSocialRouter.get(
  "/:id",
  isAdminVerified,
  fetchSocialValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return SocialController.fetchSocial(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminSocialRouter.delete(
  "/:id",
  isAdminVerified,
  deleteSocialValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return SocialController.deleteSocial(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminSocialRouter.post(
  "/",
  isAdminVerified,
  createSocialValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return SocialController.createSocial(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminSocialRouter.put(
  "/:id",
  isAdminVerified,
  updateSocialValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return SocialController.updateSocial(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
