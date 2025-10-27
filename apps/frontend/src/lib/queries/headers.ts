import { useQuery } from "@tanstack/react-query";
import instance from "../../../api/axios";
import { HeaderResponse } from "@/types";

export const useGetHeader = () => {
  return useQuery<HeaderResponse, Error>({
    queryKey: ["header"],
    queryFn: async (): Promise<HeaderResponse> => {
      const { data } = await instance.get<HeaderResponse>("/header");
      return data;
    },
    refetchOnWindowFocus: false,
  });
};
