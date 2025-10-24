import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as categoryController from "@/controllers/admin/website/category";
import { adminAuthenticate } from "@/middlewares/admin";
import {
  createCategoryValidation,
  deleteCategoryValidation,
  fetchCategoryValidation,
  updateCategoryValidation,
} from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

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
  "/list",
  adminAuthenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return categoryController.fetchCategoriesList(req, res, next);
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

adminCategoryRouter.delete(
  "/:id",
  adminAuthenticate,
  deleteCategoryValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return categoryController.deleteCategory(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminCategoryRouter.post(
  "/",
  adminAuthenticate,
  createCategoryValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return categoryController.createCategory(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminCategoryRouter.put(
  "/:id",
  adminAuthenticate,
  updateCategoryValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return categoryController.updateCategory(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
