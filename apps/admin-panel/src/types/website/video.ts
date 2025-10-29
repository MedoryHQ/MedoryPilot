import { File, Language } from "..";

export interface VideosResponse {
  data: Video[];
  count: number;
}

export interface VideoResponse {
  data: Video;
}

export interface Video {
  id: string;
  thumbnail?: File | null;
  link: string;
  date?: string | null;
  translations: VideoTranslation[];
  createdAt: string;
  updatedAt: string;
}

export interface VideoTranslation {
  id: string;
  name: string;
  video: Video;
  videoId: string;
  language: Language;
  languageId: string;
  createdAt: string;
  updatedAt: string;
}
