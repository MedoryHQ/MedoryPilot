import {
  SocialFormValues,
  SocialResponse,
  SocialsResponse
} from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";
import { UseFormSetValue } from "react-hook-form";

export const useGetSocials = (search?: URLSearchParams) => {
  return useQuery<SocialsResponse, Error>({
    queryKey: ["socials", search?.toString() ?? ""],
    queryFn: async (): Promise<SocialsResponse> => {
      const { data } = await instance.get<SocialsResponse>(
        `/social${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};

export const useGetSocial = (
  id: string | null,
  setValue: UseFormSetValue<SocialFormValues>
) => {
  return useQuery<SocialResponse, Error>({
    queryKey: ["socials"],
    queryFn: async (): Promise<SocialResponse> => {
      const { data } = await instance.get<SocialResponse>(`/social/${id}`);
      return data;
    },
    enabled: !!id,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    onSuccess(data: SocialResponse) {
      const { icon, name, url } = data.data;

      setValue("icon", icon);
      setValue("name", name);
      setValue("url", url);
    }
  });
};
