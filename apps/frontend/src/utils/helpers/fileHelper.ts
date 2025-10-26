import { File } from "@/types";

export const sortFilesByOrder = (files: File[]): File[] => {
  if (!Array.isArray(files) || files.length === 0) return [];

  const hasMissingOrder = files.some((f) => f.order == null);
  if (hasMissingOrder) return files;

  return [...files].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};
