import { ServicesResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import instance from "../../../api/axios";

export const useGetServices = () => {
  return useQuery<ServicesResponse, Error>({
    queryKey: ["services"],
    queryFn: async (): Promise<ServicesResponse> => {
      const { data } = await instance.get<ServicesResponse>("/service");
      return data;
    },
    refetchOnWindowFocus: false,
  });
};
