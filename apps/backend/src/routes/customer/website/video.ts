import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as VideoController from "@/controllers/customer/website/video";
import { fetchVideoValidation } from "@/validations/customer";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const videoRouter = Router();

videoRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return VideoController.fetchVideos(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

videoRouter.get(
  "/:id",
  fetchVideoValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return VideoController.fetchVideo(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
