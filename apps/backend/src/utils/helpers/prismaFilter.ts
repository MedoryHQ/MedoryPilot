import { PrismaClient } from "@prisma/client";
import { Request } from "express";

export const parseBooleanQuery = (value?: string): boolean | undefined => {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

export const generateWhereInput = <T>(
  search: string | undefined,
  fields: { [key: string]: string | boolean | undefined },
  extraConditions?: T
): T => {
  const orConditions = Object.entries(fields).map(([key, value]) => {
    const relations = key.split(".");
    const field = relations.pop();

    if (relations.length > 0 && field) {
      let nestedObject: any = {
        [field]: { contains: search, mode: "insensitive" },
      };
      while (relations.length > 0) {
        const relation = relations.pop();
        if (relation) {
          nestedObject = { [relation]: nestedObject };
        }
      }
      return nestedObject;
    }

    if (value === "insensitive") {
      return { [key]: { contains: search, mode: "insensitive" } };
    }
  });

  const andConditions = Object.entries(fields)
    .filter(([, value]) => value === true || value === false)
    .map(([key, value]) => {
      const relations = key.split(".");
      const field = relations.pop();

      if (relations.length > 0 && field) {
        let nestedObject: any = {
          [field]: value,
        };
        while (relations.length > 0) {
          const relation = relations.pop();
          if (relation) {
            nestedObject = { [relation]: nestedObject };
          }
        }
        return nestedObject;
      }

      return { [key]: value };
    });

  return {
    AND: [
      ...(orConditions.length > 0 ? [{ OR: orConditions }] : []),
      ...andConditions,
      ...(extraConditions ? [extraConditions] : []),
    ],
  } as T;
};

export const generateOrderByInput = (
  req: Request
): Record<string, "asc" | "desc"> | undefined => {
  const orderBy = req.query.orderBy as string;
  if (!orderBy) return undefined;

  const [field, direction] = orderBy.split("_");
  if (!["asc", "desc"].includes(direction)) return undefined;

  return { [field]: direction as "asc" | "desc" };
};

export const generatePaginationInput = (req: Request) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 16;

  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
  };
};

export const generateMeta = (
  totalItems: number,
  currentPage: number,
  limit: number,
  currentPageCount: number
) => ({
  total: totalItems,
  page: currentPage,
  limit,
  totalPages: Math.ceil(totalItems / limit),
  currentPageTotal: currentPageCount,
});

export const generateFiltersInput = async <T>(
  req: Request,
  prisma: PrismaClient
): Promise<T> => {
  const { color, minPrice, maxPrice, material } = req.query;

  const filters: unknown[] = [];

  const min = Number(minPrice);
  const max = Number(maxPrice);

  const validMin = !isNaN(min);
  const validMax = !isNaN(max);

  if (validMin && validMax) {
    filters.push({
      OR: [
        {
          AND: [
            { salePrice: { not: null } },
            { salePrice: { gte: min } },
            { salePrice: { lte: max } },
          ],
        },
        {
          AND: [
            { salePrice: null },
            { price: { gte: min } },
            { price: { lte: max } },
          ],
        },
      ],
    });
  }

  return {
    AND: filters,
  } as T;
};
