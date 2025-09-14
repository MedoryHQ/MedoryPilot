import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as tariffController from "@/controllers/admin/website/tariff";
import { isAdminVerified } from "@/middlewares/admin";

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
