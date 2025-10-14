import { FooterResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";

export const useGetFooter = () => {
  return useQuery<FooterResponse, Error>({
    queryKey: ["footer"],
    queryFn: async (): Promise<FooterResponse> => {
      const { data } = await instance.get<FooterResponse>("/footer");
      return data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false
  });
};
