import { File, Language } from "../global";
import { Option } from "../ui";
import { User } from "../user";
import { Category } from "./category";

export interface BlogsResponse {
  data: Blog[];
  count: number;
}

export interface BlogResponse {
  data: Blog;
}

export interface BlogsFilterOptions {
  data: {
    categories: Option[];
    users: Option[];
  };
}

export interface Blog {
  id: string;
  slug: string;
  showInLanding: boolean;
  landingOrder: number;
  background: File | null;
  categories: Category[];
  starredUsers: User[];
  stars: number;
  translations: BlogTranslation[];
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  metaImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogTranslation {
  id: string;
  title: string;
  content: string;
  blog: Blog;
  blogId: string;
  language: Language;
  languageId: string;
  createdAt: string;
  updatedAt: string;
}

export type BlogFormValues = {
  categories: string[];
  background: File | null;
  slug: string;
  showInLanding: boolean;
  landingOrder: number | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  metaImage: string | null;
  translations: {
    en: {
      content: string;
      title: string;
    };
    ka: {
      content: string;
      title: string;
    };
  };
};
