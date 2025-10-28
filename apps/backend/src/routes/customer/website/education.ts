import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as EducationController from "@/controllers/customer/website/education";

export const educationRouter = Router();

educationRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return EducationController.fetchEducations(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
