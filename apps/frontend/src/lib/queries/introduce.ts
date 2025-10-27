import { IntroduceResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import instance from "../../../api/axios";

export const useGetIntroduce = () => {
  return useQuery<IntroduceResponse, Error>({
    queryKey: ["introduce"],
    queryFn: async (): Promise<IntroduceResponse> => {
      const { data } = await instance.get<IntroduceResponse>("/introduce");
      return data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
};
