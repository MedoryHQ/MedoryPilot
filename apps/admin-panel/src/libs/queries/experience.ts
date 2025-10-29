import { ExperienceResponse, ExperiencesResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";

export const useGetExperiences = (search?: URLSearchParams) => {
  return useQuery<ExperiencesResponse, Error>({
    queryKey: ["experiences", search?.toString() ?? ""],
    queryFn: async (): Promise<ExperiencesResponse> => {
      const { data } = await instance.get<ExperiencesResponse>(
        `/experience${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};

export const useGetExperience = (id: string | null) => {
  return useQuery<ExperienceResponse, Error>({
    queryKey: ["experience", id],
    queryFn: async (): Promise<ExperienceResponse> => {
      const { data } = await instance.get<ExperienceResponse>(
        `/experience/${id}`
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
