import { FaqsResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import instance from "../../../api/axios";

export const useGetFaqs = () => {
  return useQuery<FaqsResponse, Error>({
    queryKey: ["faqs"],
    queryFn: async (): Promise<FaqsResponse> => {
      const { data } = await instance.get<FaqsResponse>("/faq");
      return data;
    },
    refetchOnWindowFocus: false,
  });
};
