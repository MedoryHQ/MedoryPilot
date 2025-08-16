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

export function calculateAge(dob: Date): number {
  if (!(dob instanceof Date) || isNaN(dob.getTime())) {
    throw new TypeError("dateOfBirth must be a valid Date");
  }
  return differenceInYears(new Date(), dob);
}

export const inMinutes = (minutes: number): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};
