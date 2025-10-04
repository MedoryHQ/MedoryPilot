import { FooterFormValues, FooterResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";
import { UseFormSetValue } from "react-hook-form";

export const useGetFooter = (
  id: string | null,
  setValue: UseFormSetValue<FooterFormValues>
) => {
  return useQuery<FooterResponse, Error>({
    queryKey: ["footers"],
    queryFn: async (): Promise<FooterResponse> => {
      const { data } = await instance.get<FooterResponse>(`/footer/${id}`);
      return data;
    },
    enabled: !!id,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    onSuccess(data: FooterResponse) {
      const { pages, socials, email, phone } = data.data;

      const filteredSocials = socials?.map((social) => social.id);
      const filteredPages = pages?.map((page) => page.id);
      setValue("socials", filteredSocials);
      setValue("pages", filteredPages);
      setValue("email", email);
      setValue("phone", phone);
    }
  });
};
