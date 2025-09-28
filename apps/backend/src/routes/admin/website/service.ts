import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as ServiceController from "@/controllers/admin/website/service";
import { adminAuthenticate } from "@/middlewares/admin";
import {
  createServiceValidation,
  deleteServiceValidation,
  fetchServiceValidation,
  updateServiceValidation,
} from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminServiceRouter = Router();

adminServiceRouter.get(
  "/",
  adminAuthenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return ServiceController.fetchServices(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminServiceRouter.get(
  "/:id",
  adminAuthenticate,
  fetchServiceValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return ServiceController.fetchService(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminServiceRouter.delete(
  "/:id",
  adminAuthenticate,
  deleteServiceValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return ServiceController.deleteService(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminServiceRouter.post(
  "/",
  adminAuthenticate,
  createServiceValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return ServiceController.createService(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminServiceRouter.put(
  "/:id",
  adminAuthenticate,
  updateServiceValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return ServiceController.updateService(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
