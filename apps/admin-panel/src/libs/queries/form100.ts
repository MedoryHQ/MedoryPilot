import { Form100Response, Form100sResponse } from "@/types";
import instance from "../../api/axios";
import { useQuery } from "react-query";

export const useGetForm100s = (search?: URLSearchParams) => {
  return useQuery<Form100sResponse, Error>({
    queryKey: ["form100s", search?.toString() ?? ""],
    queryFn: async (): Promise<Form100sResponse> => {
      const { data } = await instance.get<Form100sResponse>(
        `/form100${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};

export const useGetForm100 = (id: string | null) => {
  return useQuery<Form100Response, Error>({
    queryKey: ["form100", id],
    queryFn: async (): Promise<Form100Response> => {
      const { data } = await instance.get<Form100Response>(`/form100/${id}`);
      return data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false
  });
};
