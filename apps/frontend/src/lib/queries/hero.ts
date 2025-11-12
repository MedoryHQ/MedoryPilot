import { useQuery } from "@tanstack/react-query";
import instance from "../../../api/axios";
import { HeroResponse } from "@/types";

export const useGetHero = () => {
  return useQuery<HeroResponse, Error>({
    queryKey: ["hero"],
    queryFn: async (): Promise<HeroResponse> => {
      const { data } = await instance.get<HeroResponse>("/hero");
      return data;
    },
    refetchOnWindowFocus: false,
  });
};
