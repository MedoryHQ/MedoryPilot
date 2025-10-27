type ErrorType = {
  message: string;
  status: number;
};

type ApiError = {
  response?: {
    data: {
      errors?: Array<{ msg: { en: string; ka: string } | string }>;
      error?: { en: string; ka: string } | string;
    };
    status: number;
  };
};

export const handleError = (error: unknown, locale: string): ErrorType[] => {
  const defaultMessage = {
    en: "Something went wrong",
    ka: "რაღაც შეცდომა მოხდა",
  };
  const apiError = error as ApiError;
  const status = apiError.response?.status ?? 400;
  const messages: ErrorType[] = [];

  const getMessage = (msg: { en: string; ka: string } | string): string =>
    typeof msg === "object"
      ? msg[locale as "ka" | "en"] ||
        msg.en ||
        defaultMessage[locale as "ka" | "en"]
      : msg || defaultMessage[locale as "ka" | "en"];

  if (apiError.response?.data.errors?.length) {
    apiError.response.data.errors.forEach((err) => {
      messages.push({ message: getMessage(err.msg), status });
    });
  } else if (apiError.response?.data.error) {
    messages.push({
      message: getMessage(apiError.response.data.error),
      status,
    });
  } else {
    messages.push({ message: defaultMessage[locale as "ka" | "en"], status });
  }

  return messages;
};
