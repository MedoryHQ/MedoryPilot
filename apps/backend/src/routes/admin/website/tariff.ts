import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as tariffController from "@/controllers/admin/website/tariff";
import { isAdminVerified } from "@/middlewares/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";
import {
  createTariffValidation,
  deleteTariffValidation,
  fetchTariffValidation,
} from "@/validations/admin/website/tariff.validations";

export const adminTariffRouter = Router();

adminTariffRouter.get(
  "/",
  isAdminVerified,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return tariffController.fetchTariffs(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminTariffRouter.get(
  "/:id",
  isAdminVerified,
  fetchTariffValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return tariffController.fetchTariff(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminTariffRouter.delete(
  "/:id",
  isAdminVerified,
  deleteTariffValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return tariffController.deleteTariff(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminTariffRouter.post(
  "/",
  isAdminVerified,
  createTariffValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return tariffController.createTariff(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
