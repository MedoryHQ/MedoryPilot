import { VisitResponse, VisitsResponse } from "@/types";
import instance from "../../api/axios";
import { useQuery } from "react-query";

export const useGetVisits = (search?: URLSearchParams) => {
  return useQuery<VisitsResponse, Error>({
    queryKey: ["visits", search?.toString() ?? ""],
    queryFn: async (): Promise<VisitsResponse> => {
      const { data } = await instance.get<VisitsResponse>(
        `/visit${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};

export const useGetVisit = (id: string | null) => {
  return useQuery<VisitResponse, Error>({
    queryKey: ["visit", id],
    queryFn: async (): Promise<VisitResponse> => {
      const { data } = await instance.get<VisitResponse>(`/visit/${id}`);
      return data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false
  });
};
