import { PrismaClient } from "@prisma/client";
import { Request } from "express";

export const parseBooleanQuery = (value?: string): boolean | undefined => {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

export const isNumericString = (val: string) => {
  if (typeof val !== "string") return false;
  const n = Number(val);
  return !Number.isNaN(n) && isFinite(n);
};

export const generateWhereInput = <T>(
  search: string | undefined,
  fields: { [key: string]: string | boolean | undefined },
  extraConditions?: T
): T => {
  const hasSearch =
    typeof search === "string" && search.trim().length > 0
      ? search.trim()
      : null;

  const searchIsNumber = hasSearch !== null && isNumericString(hasSearch);

  const isProbablyStringField = (fieldName: string) => {
    const lower = fieldName.toLowerCase();
    const nonStringPatterns = [
      "id",
      "date",
      "at",
      "_count",
      "count",
      "size",
      "amount",
      "qty",
      "quantity",
    ];
    for (const p of nonStringPatterns) {
      if (lower.includes(p)) return false;
    }
    if (lower.includes("price")) return false;
    return true;
  };

  const orConditions = hasSearch
    ? Object.entries(fields)
        .map(([key, value]) => {
          if (value !== "insensitive") return undefined;
          const relations = key.split(".");
          const field = relations.pop();
          if (!field) return undefined;

          if (!isProbablyStringField(field)) return undefined;

          let nestedObject: any = {
            [field]: { contains: hasSearch, mode: "insensitive" },
          };
          while (relations.length > 0) {
            const relation = relations.pop();
            if (relation) {
              nestedObject = { [relation]: nestedObject };
            }
          }
          return nestedObject;
        })
        .filter(Boolean)
    : [];

  const numericConditions =
    hasSearch && searchIsNumber
      ? Object.entries(fields)
          .map(([key, value]) => {
            const fieldName = key.split(".").pop();
            if (!fieldName) return undefined;
            if (fieldName.toLowerCase().includes("price")) {
              const relations = key.split(".");
              const field = relations.pop();
              let nestedObject: any = { [field!]: Number(hasSearch) };
              while (relations.length > 0) {
                const relation = relations.pop();
                if (relation) {
                  nestedObject = { [relation]: nestedObject };
                }
              }
              return nestedObject;
            }
            return undefined;
          })
          .filter(Boolean)
      : [];

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

  const orPart = [
    ...(orConditions.length > 0 ? orConditions : []),
    ...(numericConditions.length > 0 ? numericConditions : []),
  ];

  return {
    AND: [
      ...(orPart.length > 0 ? [{ OR: orPart }] : []),
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
