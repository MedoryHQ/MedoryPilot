import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as heroController from "@/controllers/admin/website/hero";
import { adminAuthenticate } from "@/middlewares/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";
import {
  createHeroValidation,
  deleteHeroValidation,
  fetchHeroValidation,
  updateHeroValidation,
} from "@/validations/admin";

export const adminHeroRouter = Router();

adminHeroRouter.get(
  "/",
  adminAuthenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return heroController.fetchHeros(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminHeroRouter.get(
  "/:id",
  adminAuthenticate,
  fetchHeroValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return heroController.fetchHero(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminHeroRouter.delete(
  "/:id",
  adminAuthenticate,
  deleteHeroValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return heroController.deleteHero(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminHeroRouter.post(
  "/",
  adminAuthenticate,
  createHeroValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return heroController.createHero(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminHeroRouter.put(
  "/:id",
  adminAuthenticate,
  updateHeroValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return heroController.updateHero(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
