import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as categoryController from "@/controllers/admin/website/category";
import { adminAuthenticate } from "@/middlewares/admin";
import { fetchCategoryValidation } from "@/validations/admin";

export const adminCategoryRouter = Router();

adminCategoryRouter.get(
  "/",
  adminAuthenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return categoryController.fetchCategories(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminCategoryRouter.get(
  "/:id",
  adminAuthenticate,
  fetchCategoryValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return categoryController.fetchCategory(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
