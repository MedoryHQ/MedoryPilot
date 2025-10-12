import { ContactResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";

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
    refetchInterval: false
  });
};
