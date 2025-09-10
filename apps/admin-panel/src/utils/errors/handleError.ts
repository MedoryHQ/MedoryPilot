import { ResponseError } from "@/types";

export type ToastHelpers = {
  error: (title: string, description?: string, options?: any) => any;
};

const defaultError = {
  en: "Something went wrong",
  ka: "რაღაც შეცდომა მოხდა"
};

const extractLocalizedString = (value: any, lang: "ka" | "en") => {
  if (!value && value !== 0) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return (
      value[lang] ??
      value.en ??
      Object.values(value).find((v) => typeof v === "string") ??
      ""
    );
  }
  return String(value);
};

export const handleError = (
  error: ResponseError,
  lang: "ka" | "en" = "ka"
): string[] => {
  const errorMessages: string[] = [];

  const globalErrorMessage = defaultError[lang];

  const resp =
    (error && (error as any).response && (error as any).response.data) || null;

  if (resp && Array.isArray(resp.errors) && resp.errors.length > 0) {
    resp.errors.forEach((err: any) => {
      const candidate = err.msg ?? err.message ?? err;
      const localized =
        extractLocalizedString(candidate, lang) || globalErrorMessage;
      errorMessages.push(localized);
    });

    return errorMessages;
  }

  if (resp && resp.error) {
    const localized =
      extractLocalizedString(resp.error, lang) || globalErrorMessage;
    errorMessages.push(localized);
    return errorMessages;
  }

  if (resp && resp.message) {
    const localized =
      extractLocalizedString(resp.message, lang) || globalErrorMessage;
    errorMessages.push(localized);
    return errorMessages;
  }

  errorMessages.push(globalErrorMessage);
  return errorMessages;
};

export const returnError = (
  error: ResponseError,
  toast: ToastHelpers,
  t?: (key: string) => string,
  lang: "ka" | "en" = "ka",
  defaultMessage?: string | null
) => {
  const title = t ? t("toast.error") : lang === "ka" ? "შეცდომა" : "Error";
  const errors = handleError(error, lang);

  if (errors.length > 0) {
    errors.forEach((errMsg) => {
      toast.error(title, errMsg);
    });
    return;
  }

  const fallback =
    defaultMessage ?? (t ? t("toast.operation.failed") : defaultError[lang]);
  toast.error(title, fallback);
};
