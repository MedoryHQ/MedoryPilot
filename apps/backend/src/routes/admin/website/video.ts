import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as VideoController from "@/controllers/admin/website/video";
import { adminAuthenticate } from "@/middlewares/admin";
import {
  createVideoValidation,
  deleteVideoValidation,
  fetchVideoValidation,
  updateVideoValidation,
} from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminVideoRouter = Router();

adminVideoRouter.get(
  "/",
  adminAuthenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return VideoController.fetchVideos(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminVideoRouter.get(
  "/:id",
  adminAuthenticate,
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

adminVideoRouter.delete(
  "/:id",
  adminAuthenticate,
  deleteVideoValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return VideoController.deleteVideo(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminVideoRouter.post(
  "/",
  adminAuthenticate,
  createVideoValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return VideoController.createVideo(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
