import { AboutResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import instance from "../../../api/axios";

export const useGetAbout = () => {
  return useQuery<AboutResponse, Error>({
    queryKey: ["about"],
    queryFn: async (): Promise<AboutResponse> => {
      const { data } = await instance.get<AboutResponse>("/about");
      return data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
};
