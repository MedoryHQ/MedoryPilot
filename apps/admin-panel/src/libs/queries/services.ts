import {
  ServiceFormValues,
  ServiceResponse,
  ServicesResponse
} from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";
import { UseFormSetValue } from "react-hook-form";

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
