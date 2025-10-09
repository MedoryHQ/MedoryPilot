import { SocialResponse, SocialsResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";

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

export const useGetSocial = (id: string | null) => {
  return useQuery<SocialResponse, Error>({
    queryKey: ["socials", id],
    queryFn: async (): Promise<SocialResponse> => {
      const { data } = await instance.get<SocialResponse>(`/social/${id}`);
      return data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false
  });
};
