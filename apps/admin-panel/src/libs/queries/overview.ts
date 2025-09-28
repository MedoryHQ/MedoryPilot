import { OverviewResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";

export const useGetOverview = () => {
  return useQuery<OverviewResponse, Error>({
    queryKey: ["overview"],
    queryFn: async (): Promise<OverviewResponse> => {
      const { data } = await instance.get<OverviewResponse>("/overview");
      return data;
    },
    refetchOnWindowFocus: false
  });
};
