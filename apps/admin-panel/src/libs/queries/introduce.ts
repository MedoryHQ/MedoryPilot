import { IntroduceFormValues, IntroduceResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";
import { UseFormSetValue } from "react-hook-form";

export const useGetIntroduce = (
  id: string | null,
  setValue: UseFormSetValue<IntroduceFormValues>
) => {
  return useQuery<IntroduceResponse, Error>({
    queryKey: ["introduces"],
    queryFn: async (): Promise<IntroduceResponse> => {
      const { data } = await instance.get<IntroduceResponse>(
        `/introduce/${id}`
      );
      return data;
    },
    enabled: !!id,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    onSuccess(data: IntroduceResponse) {
      const { translations } = data.data;

      const enTranslation = translations?.find(
        (translation) => translation.language.code === "en"
      );
      const kaTranslation = translations?.find(
        (translation) => translation.language.code === "ka"
      );

      const formTranslations = {
        en: {
          description: enTranslation?.description || "",
          headline: enTranslation?.headline || ""
        },
        ka: {
          description: kaTranslation?.description || "",
          headline: kaTranslation?.headline || ""
        }
      };

      setValue("translations", formTranslations);
    }
  });
};
