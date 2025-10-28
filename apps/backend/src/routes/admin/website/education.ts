import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as EducationController from "@/controllers/admin/website/education";
import { adminAuthenticate } from "@/middlewares/admin";
import {
  createEducationValidation,
  deleteEducationValidation,
  fetchEducationValidation,
  updateEducationValidation,
} from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminEducationRouter = Router();

adminEducationRouter.get(
  "/",
  adminAuthenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return EducationController.fetchEducations(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminEducationRouter.get(
  "/:id",
  adminAuthenticate,
  fetchEducationValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return EducationController.fetchEducation(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminEducationRouter.delete(
  "/:id",
  adminAuthenticate,
  deleteEducationValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return EducationController.deleteEducation(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminEducationRouter.post(
  "/",
  adminAuthenticate,
  createEducationValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return EducationController.createEducation(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
