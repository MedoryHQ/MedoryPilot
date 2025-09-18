import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as blogController from "@/controllers/admin/website/blog";
import { isAdminVerified } from "@/middlewares/admin";

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
