import { prisma } from "@/config";
import { Translation } from "@/types/global";
import { getResponseMessage, isUuid } from "@/utils";
import { body, param } from "express-validator";

export const validateTranslations = (
  translations: Translation,
  fieldNames: {
    name: string;
    required?: boolean;
  }[]
) => {
  if (!translations || typeof translations !== "object") {
    throw new Error(
      JSON.stringify([
        {
          ka: "აუციელებელია ერთი თარგმანი მაინც",
          en: "At least one translation is required",
          field: "translations",
        },
      ])
    );
  }

  const errors: { ka: string; en: string; field: string }[] = [];
  const languageKeys = Object.keys(translations);

  if (languageKeys.length === 0) {
    errors.push({
      ka: "აუციელებელია ერთი თარგმანი მაინც",
      en: "At least one translation is required",
      field: "translations",
    });
  } else {
    if (!languageKeys.includes("en")) {
      errors.push({
        ka: "აუციელებელია 'en' თარგმანი",
        en: "The 'en' translation is required",
        field: "translations",
      });
    }
    if (!languageKeys.includes("ka")) {
      errors.push({
        ka: "აუციელებელია 'ka' თარგმანი",
        en: "The 'ka' translation is required",
        field: "translations",
      });
    }
  }

  languageKeys.forEach((language) => {
    fieldNames.forEach((field) => {
      const value = translations[language]?.[field.name];

      if (field.required && !value) {
        errors.push({
          ka: `${language} ველი '${field.name}' აუცილელებელია`,
          en: `The ${language} field '${field.name}' is required`,
          field: field.name,
        });
      } else if (value && typeof value !== "string") {
        errors.push({
          ka: `${language} ველი '${field.name}' უნდა იყოს ტექსტი`,
          en: `The ${language} field '${field.name}' must be a string`,
          field: field.name,
        });
      }
    });
  });

  if (errors.length > 0) {
    throw new Error(JSON.stringify(errors));
  }

  return true;
};

export const generateMetaValidations = () => {
  return [
    body("metaTitle").isString().optional({ nullable: true }),
    body("metaDescription").isString().optional({ nullable: true }),
    body("metaKeywords").isString().optional({ nullable: true }),
    body("metaImage").isObject().optional({ nullable: true }),
  ];
};

export const uniqueFieldValidation = (
  field: string,
  modelName: string,
  optional?: boolean
) => {
  let validator = body(field);

  if (optional) {
    validator = validator.optional();
  }

  return validator.custom(async (value) => {
    if (value === undefined || value === null) return true;

    const model = await prisma[modelName as keyof typeof prisma] // @ts-expect-error modelName is dynamic
      .findUnique({
        where: { [field]: value },
      });

    if (model) {
      throw new Error(
        JSON.stringify({
          ka: `${modelName} ასეთი ${field}-ით უკვე არსებობს`,
          en: `${modelName} with this ${field} already exists`,
        })
      );
    }

    return true;
  });
};

export const existanceValidation = (field: string, modelName: string) => {
  return body(field).custom(async (value) => {
    if (value === undefined || value === null) return true;

    const model = await prisma[modelName as keyof typeof prisma] // @ts-expect-error modelName is dynamic
      .findUnique({
        where: { [field]: value },
      });

    if (!model) {
      throw new Error(
        JSON.stringify({
          ka: `${modelName} ასეთი ${field}-ით ვერ მოიძებნა`,
          en: `${modelName} with this ${field} was not found`,
        })
      );
    }

    return true;
  });
};

export const uuidsArrayValidation = (
  field: string,
  min?: number,
  max?: number
) => {
  return body(field).custom((value) => {
    if (!Array.isArray(value)) {
      throw new Error(
        JSON.stringify({
          ka: `${field} უნდა იყოს მასივი`,
          en: `${field} must be an array`,
        })
      );
    }

    if (min && value.length < min) {
      throw new Error(
        JSON.stringify({
          ka: `${field} უნდა შეიცავდეს მინიმუმ ${min} ელემენტს`,
          en: `${field} must contain at least ${min} elements`,
        })
      );
    }

    if (max && value.length > max) {
      throw new Error(
        JSON.stringify({
          ka: `${field} უნდა შეიცავდეს მაქსიმუმ ${max} ელემენტს`,
          en: `${field} must contain at most ${max} elements`,
        })
      );
    }

    if (!value.every((id: string) => typeof id === "string" && isUuid(id))) {
      throw new Error(
        JSON.stringify({
          ka: "მასივის ყველა ელემენტი უნდა იყოს სწორი UUID",
          en: "All elements in the array must be valid UUIDs",
        })
      );
    }

    return true;
  });
};

export const phoneValidation = (field = "phoneNumber") =>
  body(field)
    .isString()
    .matches(/^\+9955\d{8}$/)
    .withMessage("invalidPhoneNumber");

export const emailValidation = (field = "email", optional = false) => {
  let v = body(field).isEmail().withMessage("invalidEmail");
  if (optional) v = v.optional();
  return v;
};

export const passwordValidation = (field = "password") =>
  body(field)
    .isString()
    .withMessage("invalidPassword")
    .isLength({ min: 8, max: 100 })
    .withMessage("passwordLength");

export const confirmPasswordValidation = () =>
  body("confirmPassword")
    .isString()
    .withMessage("invalidConfirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(getResponseMessage("passwordsNotMatch").en);
      }
      return true;
    });

export const codeValidation = (field = "code") =>
  body(field)
    .isLength({ min: 4, max: 6 })
    .isNumeric()
    .withMessage("invalidCode");

export const uuidValidation = () =>
  param("id").isUUID().withMessage("invalidId");

export const slugValidation = () =>
  param("slug")
    .isString()
    .trim()
    .toLowerCase()
    .isLength({ min: 1, max: 120 })
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage("invalidSlug");

export const bodySlugValidation = () =>
  body("slug")
    .isString()
    .trim()
    .toLowerCase()
    .isLength({ min: 1, max: 120 })
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage("invalidSlug");

export const relationArrayValidation = (
  field: string,
  modelName: keyof typeof prisma,
  {
    min = 1,
    max,
    optional = false,
  }: {
    min?: number;
    max?: number;
    optional?: boolean;
  } = {}
) => {
  let chain = body(field);

  if (optional) {
    chain = chain.optional({ nullable: true });
  }

  chain = chain.custom(async (ids: string[] | undefined) => {
    if (!ids || ids.length === 0) return true;

    if (!Array.isArray(ids)) {
      throw new Error(
        JSON.stringify({
          en: `${field} must be an array`,
          ka: `${field} უნდა იყოს მასივი`,
        })
      );
    }

    if (ids.length < min) {
      throw new Error(
        JSON.stringify({
          en: `${field} must have at least ${min} item(s)`,
          ka: `${field} უნდა ჰქონდეს მინიმუმ ${min} ელემენტი`,
        })
      );
    }

    if (max && ids.length > max) {
      throw new Error(
        JSON.stringify({
          en: `${field} must not contain more than ${max} items`,
          ka: `${field} უნდა შეიცავდეს მაქსიმუმ ${max} ელემენტს`,
        })
      );
    }

    const invalid = ids.filter((id) => {
      return !isUuid(id);
    });
    if (invalid?.length > 0) {
      throw new Error(
        JSON.stringify({
          en: `Invalid ${field} IDs: ${invalid.join(", ")}`,
          ka: `არასწორი ${field} ID: ${invalid.join(", ")}`,
        })
      );
    }

    const delegate = prisma[modelName] as any;
    const count = await delegate.count({
      where: { id: { in: ids } },
    });

    if (count !== ids.length) {
      throw new Error(
        JSON.stringify({
          en: `Some ${field} do not exist`,
          ka: `ზოგიერთი ${field} არ არსებობს`,
        })
      );
    }

    return true;
  });

  return chain;
};
