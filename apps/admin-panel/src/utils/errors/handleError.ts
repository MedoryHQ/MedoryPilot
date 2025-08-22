export const handleError = (error: any): string[] => {
  const errorMessages: string[] = [];

  const globalError = {
    en: "Something went wrong",
    ka: "რაღაც შეცდომა მოხდა"
  };

  const globalErrorMessage = globalError["ka" as keyof typeof globalError];

  if (error.response && Array.isArray(error.response.data.errors)) {
    error.response.data.errors.forEach((err: any) => {
      if (typeof err.msg === "object") {
        errorMessages.push(err.msg["ka"]);
      } else {
        errorMessages.push(err.msg || globalErrorMessage);
      }
    });
  } else if (error.response && error.response.data.error) {
    if (typeof error.response.data.error === "object") {
      errorMessages.push(error.response.data.error["ka"]);
    } else {
      errorMessages.push(error.response.data.error || globalErrorMessage);
    }
  } else {
    errorMessages.push(globalErrorMessage);
  }

  return errorMessages;
};
