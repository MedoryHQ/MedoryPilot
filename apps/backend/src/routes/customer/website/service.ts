import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as servicesController from "@/controllers/customer/website/service";

export const serviceRouter = Router();

serviceRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return servicesController.fetchServices(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
