import { ContactResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import instance from "../../../api/axios";

export const useGetContact = () => {
  return useQuery<ContactResponse, Error>({
    queryKey: ["contact"],
    queryFn: async (): Promise<ContactResponse> => {
      const { data } = await instance.get<ContactResponse>("/contact");
      return data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
};
