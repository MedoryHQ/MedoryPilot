import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as ServiceController from "@/controllers/admin/website/services";
import { isAdminVerified } from "@/middlewares/admin";
import { fetchServiceValidation } from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminServiceRouter = Router();

adminServiceRouter.get(
  "/",
  isAdminVerified,
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
  isAdminVerified,
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
