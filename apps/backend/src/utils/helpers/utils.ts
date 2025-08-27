import slugify from "slugify";
import { differenceInYears } from "date-fns";

export function generateSlug(title: string): string {
  return slugify(title, {
    lower: true,
    locale: "en",
    trim: true,
    strict: true,
    replacement: "-",
    remove: /[*+~.()'"!:@]/g,
  });
}

export function calculateAge(dob: Date | null): number | null {
  if (!dob || !(dob instanceof Date) || isNaN(dob.getTime())) {
    return null;
  }
  return differenceInYears(new Date(), dob);
}

export const inMinutes = (minutes: number): Date => {
  // TODO: change 0.5 with minutes after development
  return new Date(Date.now() + 0.5 * 60 * 1000);
};
