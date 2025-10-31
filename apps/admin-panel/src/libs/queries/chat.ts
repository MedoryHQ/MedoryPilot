import { ChatResponse, ChatsResponse } from "@/types";
import instance from "../../api/axios";
import { useQuery } from "react-query";

export const useGetChats = (search?: URLSearchParams) => {
  return useQuery<ChatsResponse, Error>({
    queryKey: ["chats", search?.toString() ?? ""],
    queryFn: async (): Promise<ChatsResponse> => {
      const { data } = await instance.get<ChatsResponse>(
        `/chat${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};

export const useGetChat = (id: string | null) => {
  return useQuery<ChatResponse, Error>({
    queryKey: ["chat", id],
    queryFn: async (): Promise<ChatResponse> => {
      const { data } = await instance.get<ChatResponse>(`/chat/${id}`);
      return data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false
  });
};
