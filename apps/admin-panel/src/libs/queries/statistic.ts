import {
  DailyStatResponse,
  DailyStatsResponse,
  MonthlyStatResponse,
  MonthlyStatsResponse
} from "@/types";
import instance from "../../api/axios";
import { useQuery } from "react-query";

export const useGetDailyStats = (search?: URLSearchParams) => {
  return useQuery<DailyStatsResponse, Error>({
    queryKey: ["daily-statistics", search?.toString() ?? ""],
    queryFn: async (): Promise<DailyStatsResponse> => {
      const { data } = await instance.get<DailyStatsResponse>(
        `/statistic/daily${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};

export const useGetDailyStat = (id: string | null) => {
  return useQuery<DailyStatResponse, Error>({
    queryKey: ["daily-statistic", id],
    queryFn: async (): Promise<DailyStatResponse> => {
      const { data } = await instance.get<DailyStatResponse>(
        `/statistic/daily/${id}`
      );
      return data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false
  });
};

export const useGetMonthlyStats = (search?: URLSearchParams) => {
  return useQuery<MonthlyStatsResponse, Error>({
    queryKey: ["monthly-statistics", search?.toString() ?? ""],
    queryFn: async (): Promise<MonthlyStatsResponse> => {
      const { data } = await instance.get<MonthlyStatsResponse>(
        `/statistic/monthly${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};

export const useGetMonthlyStat = (id: string | null) => {
  return useQuery<MonthlyStatResponse, Error>({
    queryKey: ["monthly-statistic", id],
    queryFn: async (): Promise<MonthlyStatResponse> => {
      const { data } = await instance.get<MonthlyStatResponse>(
        `/statistic/monthly/${id}`
      );
      return data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false
  });
};
