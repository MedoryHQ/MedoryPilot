import {
  PageComponentFormValues,
  PageComponentResponse,
  PageComponentsResponse
} from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";
import { UseFormSetValue } from "react-hook-form";

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
