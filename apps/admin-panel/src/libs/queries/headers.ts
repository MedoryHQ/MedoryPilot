import { HeaderResponse, HeadersResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";

export const useGetHeaders = (search?: URLSearchParams) => {
  return useQuery<HeadersResponse, Error>({
    queryKey: ["headers", search?.toString() ?? ""],
    queryFn: async (): Promise<HeadersResponse> => {
      const { data } = await instance.get<HeadersResponse>(
        `/header${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};

export const useGetHeader = (id: string | null) => {
  return useQuery<HeaderResponse, Error>({
    queryKey: ["header", id],
    queryFn: async (): Promise<HeaderResponse> => {
      const { data } = await instance.get<HeaderResponse>(`/header/${id}`);
      return data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false
  });
};
