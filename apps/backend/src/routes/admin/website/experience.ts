import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as ExperienceController from "@/controllers/admin/website/experience";
import { adminAuthenticate } from "@/middlewares/admin";
import {
  createExperienceValidation,
  deleteExperienceValidation,
  fetchExperienceValidation,
  updateExperienceValidation,
} from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminExperienceRouter = Router();

adminExperienceRouter.get(
  "/",
  adminAuthenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return ExperienceController.fetchExperiences(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminExperienceRouter.get(
  "/:id",
  adminAuthenticate,
  fetchExperienceValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return ExperienceController.fetchExperience(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminExperienceRouter.delete(
  "/:id",
  adminAuthenticate,
  deleteExperienceValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return ExperienceController.deleteExperience(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminExperienceRouter.post(
  "/",
  adminAuthenticate,
  createExperienceValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return ExperienceController.createExperience(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
