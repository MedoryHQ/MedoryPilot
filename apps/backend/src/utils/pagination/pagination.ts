import { Request } from "express";
import { Pagination } from "@/types/global";

export const getPaginationAndFilters = (req: Request): Pagination => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.pageSize as string) || 10;
  const orderBy = (req.query.orderBy as string) || "createdAt";
  const order = (req.query.order as string) || "desc";
  const search = (req.query.search as string) || "";

  return {
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      [orderBy]: order as "asc" | "desc",
    },
    search,
  };
};
