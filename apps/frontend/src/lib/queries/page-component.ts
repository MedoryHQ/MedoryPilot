import { PageComponentResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import instance from "../../../api/axios";

export const useGetPageComponent = (slug: string | null) => {
  return useQuery<PageComponentResponse, Error>({
    queryKey: ["pageComponent", slug],
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
    refetchInterval: false,
  });
};
