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
    const errorObj = err.response.data.error;
    const errorMsg =
      typeof errorObj === "string"
        ? errorObj
        : errorObj[lang] || errorObj.en || defaultError[lang];
    toast.error(t("toast.error"), errorMsg);
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
  let hasFieldError = false;

  if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
    err.response.data.errors.forEach((error) => {
      hasFieldError = true;
      const errorMessage =
        typeof error.message === "string"
          ? isJson(error.message)
            ? JSON.parse(error.message)[lang]
            : error.message
          : error.message[lang];

      if (setError) {
        setError(error.path, { message: errorMessage });
      }
      toast.error(t("toast.validationError"), errorMessage);
    });
  }

  if (!hasFieldError || err?.response?.data?.error) {
    throwErrMessage(err, toast, t, lang);
  }
};
