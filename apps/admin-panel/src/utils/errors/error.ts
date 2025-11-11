import { ResponseError } from "@/types";

const defaultError = {
  en: "Something went wrong",
  ka: "რაღაც შეცდომა მოხდა"
};

export const isJson = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export const throwErrMessage = (
  err: ResponseError,
  toast: ReturnType<any>["toast"],
  t: (key: string) => string,
  lang: "ka" | "en"
) => {
  if (err?.response?.data?.error) {
    toast.error(t("toast.error"), err.response.data.error[lang]);
  } else {
    toast.error(t("toast.error"), defaultError[lang]);
  }
};

export const setHookFormErrors = (
  err: ResponseError,
  toast: ReturnType<any>["toast"],
  t: (key: string) => string,
  lang: "ka" | "en",
  setError?: (name: any, error: { message: string }) => void
) => {
  if (err?.response?.data?.errors) {
    err.response.data.errors.forEach((error) => {
      const errorMessage =
        typeof error.message === "string"
          ? isJson(error.message)
            ? JSON.parse(error.message)[lang]
            : error.message
          : error.message[lang];

      if (setError) {
        setError(error.path, { message: errorMessage });
      } else {
        toast.error(t("toast.validationError"), errorMessage);
      }
    });
  } else {
    throwErrMessage(err, toast, t, lang);
  }
};
