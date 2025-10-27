import { BlogResponse, BlogsFilterOptions, BlogsResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import instance from "../../../api/axios";

export const useGetBlogs = (search?: URLSearchParams) => {
  return useQuery<BlogsResponse, Error>({
    queryKey: ["blogs", search?.toString() ?? ""],
    queryFn: async (): Promise<BlogsResponse> => {
      const { data } = await instance.get<BlogsResponse>(
        `/blog${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false,
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
    refetchInterval: false,
  });
};

export const useGetBlogsFilterOptions = (
  languageCode: "en" | "ka",
  search?: URLSearchParams
) => {
  return useQuery<BlogsFilterOptions, Error>({
    queryKey: ["blogs", languageCode, search?.toString() ?? ""],
    queryFn: async (): Promise<BlogsFilterOptions> => {
      const { data } = await instance.get<BlogsFilterOptions>(
        `/blog/filter-options?languageCode=${languageCode}${
          search ? `&${search}` : ""
        }`
      );
      return data;
    },
    enabled: !!languageCode,
    refetchOnWindowFocus: false,
  });
};
