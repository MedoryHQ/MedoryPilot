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

export const useGetFaq = (
  id: string | null,
  setValue: UseFormSetValue<FaqFormValues>
) => {
  return useQuery<FaqResponse, Error>({
    queryKey: ["faqs"],
    queryFn: async (): Promise<FaqResponse> => {
      const { data } = await instance.get<FaqResponse>(`/faq/${id}`);
      return data;
    },
    enabled: !!id,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    onSuccess(data: FaqResponse) {
      const { translations, order } = data.data;

      const enTranslation = translations?.find(
        (translation) => translation.language.code === "en"
      );
      const kaTranslation = translations?.find(
        (translation) => translation.language.code === "ka"
      );

      const formTranslations = {
        en: {
          question: enTranslation?.question || "",
          answer: enTranslation?.answer || ""
        },
        ka: {
          question: kaTranslation?.question || "",
          answer: kaTranslation?.answer || ""
        }
      };

      setValue("order", order);
      setValue("translations", formTranslations);
    }
  });
};
