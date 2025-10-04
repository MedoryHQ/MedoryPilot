import { ContactFormValues, ContactResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";
import { UseFormSetValue } from "react-hook-form";

export const useGetContact = (
  id: string | null,
  setValue: UseFormSetValue<ContactFormValues>
) => {
  return useQuery<ContactResponse, Error>({
    queryKey: ["contacts"],
    queryFn: async (): Promise<ContactResponse> => {
      const { data } = await instance.get<ContactResponse>(`/contact/${id}`);
      return data;
    },
    enabled: !!id,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    onSuccess(data: ContactResponse) {
      const { translations, background, location } = data.data;

      const enTranslation = translations?.find(
        (translation) => translation.language.code === "en"
      );
      const kaTranslation = translations?.find(
        (translation) => translation.language.code === "ka"
      );

      const formTranslations = {
        en: {
          title: enTranslation?.title || "",
          description: enTranslation?.description || ""
        },
        ka: {
          title: kaTranslation?.title || "",
          description: kaTranslation?.description || ""
        }
      };

      setValue("location", location);
      setValue("background", background);
      setValue("translations", formTranslations);
    }
  });
};
