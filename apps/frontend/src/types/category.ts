import { Language, Blog } from ".";

export interface CategoriesResponse {
  data: Category[];
  count: number;
}

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
