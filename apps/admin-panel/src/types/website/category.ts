import { Language } from "../global";
import { Blog } from "./blog";

export interface CategoriesResponse {
  data: Category[];
  count: number;
}

export interface CategoryResponse {
  data: Category;
}

export interface Category {
  id: string;
  blogs: Blog[];
  translations: CategoryTranslation[];
  _count: {
    blogs: number;
  };
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
