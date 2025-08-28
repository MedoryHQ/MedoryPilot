import { ResponseError } from "@/types";
import { FormInstance } from "antd";
import { MessageInstance } from "antd/es/message/interface";

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
  if (err.response.data.error) {
    message.error(err.response.data.error.ka);
  } else {
    message.error("რაღაც შეცდომა მოხდა");
  }
};

export const setFormErrors = (
  err: ResponseError,
  message: MessageInstance,
  form?: FormInstance
) => {
  if (err.response.data.errors) {
    err.response.data.errors.forEach((error) => {
      const errorMessage =
        typeof error.message === "string"
          ? isJson(error.message)
            ? JSON.parse(error.message).ka
            : error.message
          : error.message.ka;

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
