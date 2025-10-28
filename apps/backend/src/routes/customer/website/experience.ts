import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as ExperienceController from "@/controllers/customer/website/experience";

export const experienceRouter = Router();

experienceRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return ExperienceController.fetchExperiences(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
