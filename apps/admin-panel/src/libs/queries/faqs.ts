import { FaqFormValues, FaqResponse, FaqsResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";
import { UseFormSetValue } from "react-hook-form";

export const useGetFaqs = (search?: URLSearchParams) => {
  return useQuery<FaqsResponse, Error>({
    queryKey: ["faqs", search?.toString() ?? ""],
    queryFn: async (): Promise<FaqsResponse> => {
      const { data } = await instance.get<FaqsResponse>(
        `/faq${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};
