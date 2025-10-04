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

export const useGetNews = (
  slug: string | null,
  setValue: UseFormSetValue<NewsFormValues>
) => {
  return useQuery<NewsResponse, Error>({
    queryKey: ["newses"],
    queryFn: async (): Promise<NewsResponse> => {
      const { data } = await instance.get<NewsResponse>(`/news/${slug}`);
      return data;
    },
    enabled: !!slug,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    onSuccess(data: NewsResponse) {
      const {
        translations,
        background,
        order,
        slug,
        showInLanding,
        metaDescription,
        metaImage,
        metaKeywords,
        metaTitle
      } = data.data;

      const enTranslation = translations?.find(
        (translation) => translation.language.code === "en"
      );
      const kaTranslation = translations?.find(
        (translation) => translation.language.code === "ka"
      );

      const formTranslations = {
        en: {
          content: enTranslation?.content || ""
        },
        ka: {
          content: kaTranslation?.content || ""
        }
      };

      setValue("order", order);
      setValue("slug", slug);
      setValue("showInLanding", showInLanding);
      setValue("metaDescription", metaDescription || "");
      setValue("metaImage", metaImage || null);
      setValue("metaKeywords", metaKeywords || "");
      setValue("metaTitle", metaTitle || "");
      setValue("background", background);
      setValue("translations", formTranslations);
    }
  });
};
