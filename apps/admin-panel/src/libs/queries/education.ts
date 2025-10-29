import { EducationResponse, EducationsResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";

export const useGetEducations = (search?: URLSearchParams) => {
  return useQuery<EducationsResponse, Error>({
    queryKey: ["educations", search?.toString() ?? ""],
    queryFn: async (): Promise<EducationsResponse> => {
      const { data } = await instance.get<EducationsResponse>(
        `/education${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};

export const useGetEducation = (id: string | null) => {
  return useQuery<EducationResponse, Error>({
    queryKey: ["education", id],
    queryFn: async (): Promise<EducationResponse> => {
      const { data } = await instance.get<EducationResponse>(
        `/education/${id}`
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
