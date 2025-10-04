import { NewsFormValues, NewsResponse, NewsesResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";
import { UseFormSetValue } from "react-hook-form";

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
