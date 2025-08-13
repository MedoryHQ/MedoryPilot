import slugify from "slugify";

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
