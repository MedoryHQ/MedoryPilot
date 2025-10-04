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
