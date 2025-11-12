import { HeroResponse, HerosResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";

export const useGetHeros = (search?: URLSearchParams) => {
  return useQuery<HerosResponse, Error>({
    queryKey: ["heros", search?.toString() ?? ""],
    queryFn: async (): Promise<HerosResponse> => {
      const { data } = await instance.get<HerosResponse>(
        `/hero${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};

export const useGetHero = (id: string | null) => {
  return useQuery<HeroResponse, Error>({
    queryKey: ["hero", id],
    queryFn: async (): Promise<HeroResponse> => {
      const { data } = await instance.get<HeroResponse>(`/hero/${id}`);
      return data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false
  });
};
