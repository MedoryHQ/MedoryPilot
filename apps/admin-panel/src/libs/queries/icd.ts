import { ICDResponse, ICDsResponse } from "@/types";
import instance from "../../api/axios";
import { useQuery } from "react-query";

export const useGetICDs = (search?: URLSearchParams) => {
  return useQuery<ICDsResponse, Error>({
    queryKey: ["iCDs", search?.toString() ?? ""],
    queryFn: async (): Promise<ICDsResponse> => {
      const { data } = await instance.get<ICDsResponse>(
        `/icd${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};

export const useGetICD = (id: string | null) => {
  return useQuery<ICDResponse, Error>({
    queryKey: ["ICD", id],
    queryFn: async (): Promise<ICDResponse> => {
      const { data } = await instance.get<ICDResponse>(`/icd/${id}`);
      return data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false
  });
};
