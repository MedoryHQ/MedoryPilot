import { BlogFormValues, BlogResponse, BlogsResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";
import { UseFormSetValue } from "react-hook-form";

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
