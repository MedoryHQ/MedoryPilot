import { HeadersResponse } from "@/types/website";
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
