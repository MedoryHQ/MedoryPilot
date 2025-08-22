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
