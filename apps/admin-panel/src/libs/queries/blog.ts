import { BlogFormValues, BlogResponse, BlogsResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";
import { UseFormSetValue } from "react-hook-form";

export const useGetBlogs = (search?: URLSearchParams) => {
  return useQuery<BlogsResponse, Error>({
    queryKey: ["blogs", search?.toString() ?? ""],
    queryFn: async (): Promise<BlogsResponse> => {
      const { data } = await instance.get<BlogsResponse>(
        `/blog${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};

export const useGetBlog = (
  slug: string | null,
  setValue: UseFormSetValue<BlogFormValues>
) => {
  return useQuery<BlogResponse, Error>({
    queryKey: ["blogs"],
    queryFn: async (): Promise<BlogResponse> => {
      const { data } = await instance.get<BlogResponse>(`/blog/${slug}`);
      return data;
    },
    enabled: !!slug,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    onSuccess(data: BlogResponse) {
      const {
        translations,
        background,
        slug,
        showInLanding,
        categories,
        landingOrder,
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
          title: enTranslation?.title || ""
        },
        ka: {
          content: kaTranslation?.content || "",
          title: kaTranslation?.title || ""
        }
      };

      const filteredCategories = categories?.map((category) => category.id);
      setValue("categories", filteredCategories);
      setValue("slug", slug);
      setValue("landingOrder", landingOrder);
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
