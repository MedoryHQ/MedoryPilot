import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as uploadController from "@/controllers/admin/upload";

export const uploadRouter = Router();

uploadRouter.post(
  "/single",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return uploadController.uploadImage(req, res, next);
    } catch {
      return res
        .status(500)
        .json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

uploadRouter.post(
  "/multiple",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return uploadController.uploadImages(req, res, next);
    } catch {
      return res
        .status(500)
        .json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
