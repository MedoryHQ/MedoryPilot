import { ExperiencesResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import instance from "../../../api/axios";

export const useGetExperiences = () => {
  return useQuery<ExperiencesResponse, Error>({
    queryKey: ["experiences"],
    queryFn: async (): Promise<ExperiencesResponse> => {
      const { data } = await instance.get<ExperiencesResponse>("/experience");
      return data;
    },
    refetchOnWindowFocus: false,
  });
};
