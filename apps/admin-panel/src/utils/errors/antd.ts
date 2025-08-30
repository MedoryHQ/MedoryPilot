import { ResponseError } from "@/types";
import { FormInstance } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import i18n from "i18next";

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
  message: MessageInstance
) => {
  const lang = i18n.language as "ka" | "en";
  if (err.response.data.error) {
    message.error(err.response.data.error[lang]);
  } else {
    message.error(defaultError[lang]);
  }
};

export const setFormErrors = (
  err: ResponseError,
  message: MessageInstance,
  form?: FormInstance
) => {
  if (err.response.data.errors) {
    const lang = i18n.language as "ka" | "en";
    err.response.data.errors.forEach((error) => {
      const errorMessage =
        typeof error.message === "string"
          ? isJson(error.message)
            ? JSON.parse(error.message)[lang]
            : error.message
          : error.message[lang];

      if (form) {
        const field = form.getFieldInstance(error.path);
        if (field) {
          form.scrollToField(error.path);
          form.setFields([
            {
              name: error.path,
              errors: [errorMessage]
            }
          ]);
        } else {
          message.error(errorMessage);
        }
      } else {
        message.error(errorMessage);
      }
    });
  } else {
    throwErrMessage(err, message);
  }
};
