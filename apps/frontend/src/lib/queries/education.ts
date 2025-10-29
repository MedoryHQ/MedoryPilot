import { EducationsResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import instance from "../../../api/axios";

export const useGetEducations = () => {
  return useQuery<EducationsResponse, Error>({
    queryKey: ["educations"],
    queryFn: async (): Promise<EducationsResponse> => {
      const { data } = await instance.get<EducationsResponse>("/education");
      return data;
    },
    refetchOnWindowFocus: false,
  });
};
