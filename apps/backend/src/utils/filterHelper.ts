import { Request } from "express";

export const filterHelper = (
  items: any[],
  key: string,
  field?: string
): { value: any; text: any; cityId?: any }[] => {
  return items.map((item) => {
    if (key === "translations") {
      const ka = item.translations?.find((t: any) => t.languageId === "ka");

      if (field === "fullName") {
        return {
          value: item.id,
          text: ka ? `${ka.firstName} ${ka.lastName}` : null,
        };
      }

      return {
        value: item.id,
        text: ka?.name || null,
        ...(field === "district" && { cityId: item.cityId }),
      };
    }

    if (key === "multiTranslations") {
      const ka = item.translations?.find((t: any) => t.languageId === "ka");
      const en = item.translations?.find((t: any) => t.languageId === "en");

      return {
        value: item.id,
        text: ka?.name && en?.name ? { ka: ka.name, en: en.name } : null,
        ...(field === "district" && { cityId: item.cityId }),
      };
    }

    return {
      value: item.id,
      text: item[key],
    };
  });
};

export const parseFilters = (req: Request): Record<string, any> => {
  const raw = req.query.filters as string | undefined;

  if (!raw) return {};

  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
};

export const parseQueryParams = <T extends string>(
  req: Request,
  keys: T[]
): Record<T, string[] | undefined> => {
  return keys.reduce((acc, key) => {
    const value = req.query[key];

    if (!value || value === "") {
      acc[key] = undefined;
    } else if (typeof value === "string") {
      acc[key] = value.split(",");
    } else if (Array.isArray(value)) {
      acc[key] = value as string[];
    } else {
      acc[key] = String(value).split(",");
    }

    return acc;
  }, {} as Record<T, string[] | undefined>);
};
