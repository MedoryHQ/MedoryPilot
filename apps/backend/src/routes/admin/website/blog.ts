import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as blogController from "@/controllers/admin/website/blog";
import { isAdminVerified } from "@/middlewares/admin";
import { deleteBlogValidation, fetchBlogValidation } from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminBlogRouter = Router();

adminBlogRouter.get(
  "/",
  isAdminVerified,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return blogController.fetchBlogs(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminBlogRouter.get(
  "/:slug",
  isAdminVerified,
  fetchBlogValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return blogController.fetchBlog(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminBlogRouter.delete(
  "/:slug",
  isAdminVerified,
  deleteBlogValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return blogController.deleteBlog(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
