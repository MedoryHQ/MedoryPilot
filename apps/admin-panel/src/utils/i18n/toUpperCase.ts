export const toUpperCase = (text: string): string => {
  if (typeof text !== "string") {
    throw new Error("Text must be a string");
  }

  if (/[ა-ჰ]/.test(text)) {
    return text.toLocaleUpperCase("ka-GE");
  } else if (/[a-zA-Z]/.test(text)) {
    return text;
  }

  return text;
};
