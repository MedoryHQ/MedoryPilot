import { useEffect, useState } from "react";

export function cleanKeys(target: Record<string, any>, keysToCheck: string[]) {
  keysToCheck.forEach((key) => {
    const value = target[key];
    if (
      value === undefined ||
      value === null ||
      (Array.isArray(value) && value.length === 0) ||
      value === ""
    ) {
      delete target[key];
    }
  });
  return target;
}

type Translation = {
  language: { code: string };
  [key: string]: any;
};

export const transformTranslationToObject = (
  translations?: Translation[]
): Record<string, Translation> => {
  if (!translations || translations.length === 0) return {};

  return translations.reduce<Record<string, Translation>>((acc, curr) => {
    if (curr.language?.code) {
      acc[curr.language.code] = curr;
    }
    return acc;
  }, {});
};

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

export type Lang = "en" | "ka";

export type TranslationEntity = {
  language?: { code: Lang };
  languageCode?: Lang;
  [key: string]: unknown;
};

export type MapperConfig<
  TEntity extends Record<string, unknown>,
  TForm extends Record<string, unknown> = Record<string, unknown>
> = {
  translations?: {
    fields: string[] | Record<Lang, string[]>;
    locales?: Lang[];
    getTranslationsFromEntity?: (entity: TEntity) => TranslationEntity[];
  };
  fileFields?: (keyof TEntity)[];
  copyFields?: (keyof TEntity)[];
  listToIds?: (keyof TEntity)[];
  dateFields?: (keyof TEntity)[];
  custom?: {
    [K in keyof TForm]?: (entity: TEntity) => TForm[K];
  };
};

export function mapFileField(
  file:
    | File
    | { path?: string; url?: string; name?: string; size?: number }
    | null
    | undefined
) {
  if (!file) return null;
  if (file instanceof File) return file;
  return {
    path: file.path ?? file.url ?? "",
    name: file.name ?? "",
    size: file.size
  };
}

export function findTranslation(translations: TranslationEntity[], lang: Lang) {
  return translations.find(
    (tr) => tr?.language?.code === lang || tr?.languageCode === lang
  );
}

export function buildMapper<
  TEntity extends Record<string, unknown>,
  TForm extends Record<string, unknown> = Record<string, unknown>
>(cfg: MapperConfig<TEntity, TForm>) {
  const locales = cfg.translations?.locales ?? ["en", "ka"];

  return (entity: TEntity): Partial<TForm> => {
    if (!entity || typeof entity !== "object") return {};

    const out: Partial<TForm> = {};

    if (cfg.fileFields?.length) {
      for (const field of cfg.fileFields) {
        const value = entity[field];
        if (value !== undefined) {
          out[field as keyof TForm] = mapFileField(
            value as
              | File
              | { path?: string; url?: string; name?: string; size?: number }
              | null
          ) as TForm[keyof TForm];
        }
      }
    }

    if (cfg.copyFields?.length) {
      for (const field of cfg.copyFields) {
        if (typeof entity === "object" && field in entity) {
          out[field as keyof TForm] = entity[
            field
          ] as unknown as TForm[keyof TForm];
        }
      }
    }

    if (cfg.listToIds?.length) {
      for (const field of cfg.listToIds) {
        const val = entity[field];
        out[field as keyof TForm] = Array.isArray(val)
          ? (val.map((it: any) =>
              it && (it as any).id ? (it as any).id : it
            ) as TForm[keyof TForm])
          : ([] as TForm[keyof TForm]);
      }
    }

    if (cfg.dateFields?.length) {
      for (const field of cfg.dateFields) {
        const val = entity[field];
        if (val != null) {
          out[field as keyof TForm] = new Date(
            val as string | number
          ) as TForm[keyof TForm];
        }
      }
    }

    if (cfg.translations) {
      (out as any).translations = {};
      const entityTranslations = cfg.translations.getTranslationsFromEntity
        ? cfg.translations.getTranslationsFromEntity(entity)
        : ((entity as any)["translations"] ?? []);

      const fields = cfg.translations.fields;
      const localeList = cfg.translations.locales ?? locales;

      for (const loc of localeList) {
        const trObj = findTranslation(entityTranslations, loc) ?? {};
        const fieldList = Array.isArray(fields) ? fields : (fields[loc] ?? []);
        (out as any).translations[loc] = {};
        for (const f of fieldList) {
          (out as any).translations[loc][f] = trObj[f] ?? "";
        }
      }
    }

    if (cfg.custom) {
      for (const key in cfg.custom) {
        try {
          out[key as keyof TForm] = cfg.custom[key as keyof TForm]!(entity);
        } catch {
          out[key as keyof TForm] = undefined;
        }
      }
    }

    return out;
  };
}
