import { File, Language, User, Category, Option } from ".";

export interface BlogsResponse {
  data: Blog[];
}

export interface BlogResponse {
  data: Blog;
}

export interface Blog {
  id: string;
  slug: string;
  showInLanding: boolean;
  landingOrder: number;
  background: File | null;
  categories: Category[];
  averageStar: number;
  translations: BlogTranslation[];
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  metaImage: File | null;
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

export interface BlogStar {
  id: string;
  star: number;
  user: User;
  userId: string;
  blog: Blog;
  blogId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogsFilterOptions {
  data: {
    categories: Option[];
  };
}
