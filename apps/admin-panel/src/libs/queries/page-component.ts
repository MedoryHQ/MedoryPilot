import { PageComponentResponse, PageComponentsResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";

export const useGetPageComponents = (search?: URLSearchParams) => {
  return useQuery<PageComponentsResponse, Error>({
    queryKey: ["pageComponents", search?.toString() ?? ""],
    queryFn: async (): Promise<PageComponentsResponse> => {
      const { data } = await instance.get<PageComponentsResponse>(
        `/page-component${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};

export const useGetPageComponent = (slug: string | null) => {
  return useQuery<PageComponentResponse, Error>({
    queryKey: ["pageComponents", slug],
    queryFn: async (): Promise<PageComponentResponse> => {
      const { data } = await instance.get<PageComponentResponse>(
        `/page-component/${slug}`
      );
      return data;
    },
    enabled: !!slug,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false
  });
};
