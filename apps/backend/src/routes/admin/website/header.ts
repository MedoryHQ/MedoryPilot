import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as headerController from "@/controllers/admin/website/header";
import { adminAuthenticate } from "@/middlewares/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";
import {
  createHeaderValidation,
  deleteHeaderValidation,
  fetchHeaderValidation,
  updateHeaderValidation,
} from "@/validations/admin";

export const adminHeaderRouter = Router();

adminHeaderRouter.get(
  "/",
  adminAuthenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return headerController.fetchHeaders(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminHeaderRouter.get(
  "/:id",
  adminAuthenticate,
  fetchHeaderValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return headerController.fetchHeader(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminHeaderRouter.delete(
  "/:id",
  adminAuthenticate,
  deleteHeaderValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return headerController.deleteHeader(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminHeaderRouter.post(
  "/",
  adminAuthenticate,
  createHeaderValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return headerController.createHeader(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminHeaderRouter.put(
  "/:id",
  adminAuthenticate,
  updateHeaderValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return headerController.updateHeader(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
