import { FooterResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import instance from "../../../api/axios";

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
    refetchInterval: false,
  });
};
