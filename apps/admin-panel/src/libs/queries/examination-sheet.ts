import { ExaminationSheetResponse, ExaminationSheetsResponse } from "@/types";
import instance from "../../api/axios";
import { useQuery } from "react-query";

export const useGetExaminationSheets = (search?: URLSearchParams) => {
  return useQuery<ExaminationSheetsResponse, Error>({
    queryKey: ["examinationSheets", search?.toString() ?? ""],
    queryFn: async (): Promise<ExaminationSheetsResponse> => {
      const { data } = await instance.get<ExaminationSheetsResponse>(
        `/examination-sheet${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};

export const useGetExaminationSheet = (id: string | null) => {
  return useQuery<ExaminationSheetResponse, Error>({
    queryKey: ["examinationSheet", id],
    queryFn: async (): Promise<ExaminationSheetResponse> => {
      const { data } = await instance.get<ExaminationSheetResponse>(
        `/examination-sheet/${id}`
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
