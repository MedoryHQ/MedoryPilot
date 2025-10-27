import { TariffResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import instance from "../../../api/axios";

export const useGetTariff = () => {
  return useQuery<TariffResponse, Error>({
    queryKey: ["tariff"],
    queryFn: async (): Promise<TariffResponse> => {
      const { data } = await instance.get<TariffResponse>("/tariff");
      return data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
};
