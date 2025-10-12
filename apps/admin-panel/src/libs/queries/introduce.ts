import { IntroduceResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";

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
    refetchInterval: false
  });
};
