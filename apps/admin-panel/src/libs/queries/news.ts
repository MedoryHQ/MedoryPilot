import { NewsResponse, NewsesResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";

export const useGetNewses = (search?: URLSearchParams) => {
  return useQuery<NewsesResponse, Error>({
    queryKey: ["newses", search?.toString() ?? ""],
    queryFn: async (): Promise<NewsesResponse> => {
      const { data } = await instance.get<NewsesResponse>(
        `/news${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};

export const useGetNews = (slug: string | null) => {
  return useQuery<NewsResponse, Error>({
    queryKey: ["news", slug],
    queryFn: async (): Promise<NewsResponse> => {
      const { data } = await instance.get<NewsResponse>(`/news/${slug}`);
      return data;
    },
    enabled: !!slug,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false
  });
};
