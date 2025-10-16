import { BlogResponse, BlogsResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";

export const useGetBlogs = (search?: URLSearchParams) => {
  return useQuery<BlogsResponse, Error>({
    queryKey: ["blogs", search?.toString() ?? ""],
    queryFn: async (): Promise<BlogsResponse> => {
      const { data } = await instance.get<BlogsResponse>(
        `/blog${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};

export const useGetBlog = (slug: string | null) => {
  return useQuery<BlogResponse, Error>({
    queryKey: ["blogs", slug],
    queryFn: async (): Promise<BlogResponse> => {
      const { data } = await instance.get<BlogResponse>(`/blog/${slug}`);
      return data;
    },
    enabled: !!slug,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false
  });
};

export const useGetBlogsFilterOptions = (languageCode: "en" | "ka") => {
  return useQuery<BlogsResponse, Error>({
    queryKey: ["blogs", languageCode],
    queryFn: async (): Promise<BlogsResponse> => {
      const { data } = await instance.get<BlogsResponse>(
        `/blog/filter-options?languageCode=${languageCode}`
      );
      return data;
    },
    enabled: !!languageCode,
    refetchOnWindowFocus: false
  });
};
