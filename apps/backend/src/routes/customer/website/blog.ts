import { NextFunction, Router, Request, Response } from "express";
import { GLOBAL_ERROR_MESSAGE } from "@/utils";
import * as blogController from "@/controllers/customer/website/blog";
import { fetchBlogValidation } from "@/validations/customer";
import { validationHandler } from "@/middlewares/global/validationHandler";

export const blogRouter = Router();

blogRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    return blogController.fetchBlogs(req, res, next);
  } catch {
    res.status(500).json({ errors: [{ message: GLOBAL_ERROR_MESSAGE }] });
  }
});

blogRouter.get(
  "/:slug",
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
