import {
  HeaderFormValues,
  HeaderResponse,
  HeadersResponse
} from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";
import { UseFormSetValue } from "react-hook-form";

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

export const useGetHeader = (
  id: string | null,
  setValue: UseFormSetValue<HeaderFormValues>
) => {
  return useQuery<HeaderResponse, Error>({
    queryKey: ["headers"],
    queryFn: async (): Promise<HeaderResponse> => {
      const { data } = await instance.get<HeaderResponse>(`/header/${id}`);
      return data;
    },
    enabled: !!id,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
};
