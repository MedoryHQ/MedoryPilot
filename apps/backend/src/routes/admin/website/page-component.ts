import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as pageComponentController from "@/controllers/admin/website/page-component";
import { adminAuthenticate } from "@/middlewares/admin";
import {
  createPageComponentValidation,
  deletePageComponentValidation,
  fetchPageComponentValidation,
  updatePageComponentValidation,
} from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminPageComponentRouter = Router();

adminPageComponentRouter.get(
  "/",
  adminAuthenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return pageComponentController.fetchPageComponents(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminPageComponentRouter.get(
  "/list",
  adminAuthenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return pageComponentController.fetchPageComponentsList(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminPageComponentRouter.get(
  "/:slug",
  adminAuthenticate,
  fetchPageComponentValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return pageComponentController.fetchPageComponent(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminPageComponentRouter.delete(
  "/:slug",
  adminAuthenticate,
  deletePageComponentValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return pageComponentController.deletePageComponent(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminPageComponentRouter.post(
  "/",
  adminAuthenticate,
  createPageComponentValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return pageComponentController.createPageComponent(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminPageComponentRouter.put(
  "/:slug",
  adminAuthenticate,
  updatePageComponentValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return pageComponentController.updatePageComponent(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
