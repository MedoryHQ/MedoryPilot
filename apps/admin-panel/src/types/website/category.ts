import { Language } from "../global";
import { Blog } from "./blog";

export interface Category {
  id: string;
  blogs: Blog[];
  translations: CategoryTranslation[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTranslation {
  id: string;
  name: string;
  category: Category;
  categoryId: string;
  language: Language;
  languageId: string;
  createdAt: string;
  updatedAt: string;
}
