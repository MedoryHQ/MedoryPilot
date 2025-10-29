import { AboutResponse } from "@/types/website";
import { useQuery } from "react-query";
import instance from "../../api/axios";

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
    refetchInterval: false
  });
};
