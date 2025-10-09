import { TariffResponse, TariffsResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";

export const useGetTariffs = (search?: URLSearchParams) => {
  return useQuery<TariffsResponse, Error>({
    queryKey: ["tariffs", search?.toString() ?? ""],
    queryFn: async (): Promise<TariffsResponse> => {
      const { data } = await instance.get<TariffsResponse>(
        `/tariff${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};

export const useGetTariff = (id: string | null) => {
  return useQuery<TariffResponse, Error>({
    queryKey: ["tariffs", id],
    queryFn: async (): Promise<TariffResponse> => {
      const { data } = await instance.get<TariffResponse>(`/tariff/${id}`);
      return data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false
  });
};
