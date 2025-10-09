import { FaqResponse, FaqsResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";

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

export const useGetFaq = (id: string | null) => {
  return useQuery<FaqResponse, Error>({
    queryKey: ["faqs", id],
    queryFn: async (): Promise<FaqResponse> => {
      const { data } = await instance.get<FaqResponse>(`/faq/${id}`);
      return data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false
  });
};
