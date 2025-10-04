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

export const useGetPageComponent = (
  slug: string | null,
  setValue: UseFormSetValue<PageComponentFormValues>
) => {
  return useQuery<PageComponentResponse, Error>({
    queryKey: ["pageComponents"],
    queryFn: async (): Promise<PageComponentResponse> => {
      const { data } = await instance.get<PageComponentResponse>(
        `/pageComponent/${slug}`
      );
      return data;
    },
    enabled: !!slug,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    onSuccess(data: PageComponentResponse) {
      const {
        translations,
        footerOrder,
        slug,
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
          content: enTranslation?.content || "",
          name: enTranslation?.name || ""
        },
        ka: {
          content: kaTranslation?.content || "",
          name: kaTranslation?.name || ""
        }
      };

      setValue("slug", slug);
      setValue("metaDescription", metaDescription || "");
      setValue("metaImage", metaImage || null);
      setValue("metaKeywords", metaKeywords || "");
      setValue("metaTitle", metaTitle || "");
      setValue("footerOrder", footerOrder || 0);
      setValue("translations", formTranslations);
    }
  });
};
