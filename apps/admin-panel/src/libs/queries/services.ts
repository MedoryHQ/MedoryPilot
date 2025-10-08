import { ServiceResponse, ServicesResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";

export const useGetServices = (search?: URLSearchParams) => {
  return useQuery<ServicesResponse, Error>({
    queryKey: ["services", search?.toString() ?? ""],
    queryFn: async (): Promise<ServicesResponse> => {
      const { data } = await instance.get<ServicesResponse>(
        `/service${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};

export const useGetService = (id: string | null) => {
  return useQuery<ServiceResponse, Error>({
    queryKey: ["service", id],
    queryFn: async (): Promise<ServiceResponse> => {
      const { data } = await instance.get<ServiceResponse>(`/service/${id}`);
      return data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false
  });
};
