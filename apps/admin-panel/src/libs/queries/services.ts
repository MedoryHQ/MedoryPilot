import {
  ServiceFormValues,
  ServiceResponse,
  ServicesResponse
} from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";
import { UseFormSetValue } from "react-hook-form";

export const useGetServices = (search?: URLSearchParams) => {
  return useQuery<ServicesResponse, Error>({
    queryKey: ["services", search?.toString() ?? ""],
    queryFn: async (): Promise<ServicesResponse> => {
      const { data } = await instance.get<ServicesResponse>(
        `/service${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};

export const useGetService = (
  id: string | null,
  setValue: UseFormSetValue<ServiceFormValues>
) => {
  return useQuery<ServiceResponse, Error>({
    queryKey: ["services"],
    queryFn: async (): Promise<ServiceResponse> => {
      const { data } = await instance.get<ServiceResponse>(`/service/${id}`);
      return data;
    },
    enabled: !!id,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    onSuccess(data: ServiceResponse) {
      const { translations, background, icon } = data.data;

      const enTranslation = translations?.find(
        (translation) => translation.language.code === "en"
      );
      const kaTranslation = translations?.find(
        (translation) => translation.language.code === "ka"
      );

      const formTranslations = {
        en: {
          description: enTranslation?.description || "",
          title: enTranslation?.title || ""
        },
        ka: {
          title: kaTranslation?.title || "",
          description: kaTranslation?.description || ""
        }
      };

      setValue("background", background);
      setValue("icon", icon);
      setValue("translations", formTranslations);
    }
  });
};
