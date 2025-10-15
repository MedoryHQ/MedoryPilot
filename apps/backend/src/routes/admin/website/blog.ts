import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as blogController from "@/controllers/admin/website/blog";
import { adminAuthenticate } from "@/middlewares/admin";
import {
  createBlogValidation,
  deleteBlogValidation,
  fetchBlogsFilterOptions,
  fetchBlogValidation,
  updateBlogValidation,
} from "@/validations/admin";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const adminBlogRouter = Router();

adminBlogRouter.get(
  "/",
  adminAuthenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return blogController.fetchBlogs(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminBlogRouter.get(
  "/filter-options",
  adminAuthenticate,
  fetchBlogsFilterOptions,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return blogController.fetchBlogsFilterOptions(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminBlogRouter.get(
  "/:slug",
  adminAuthenticate,
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
  adminAuthenticate,
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

adminBlogRouter.post(
  "/",
  adminAuthenticate,
  createBlogValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return blogController.createBlog(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);

adminBlogRouter.put(
  "/:slug",
  adminAuthenticate,
  updateBlogValidation,
  validationHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return blogController.updateBlog(req, res, next);
    } catch {
      res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
    }
  }
);
