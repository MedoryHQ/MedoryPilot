import { VideosResponse, VideoResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import instance from "../../../api/axios";

export const useGetVideos = () => {
  return useQuery<VideosResponse, Error>({
    queryKey: ["videos"],
    queryFn: async (): Promise<VideosResponse> => {
      const { data } = await instance.get<VideosResponse>("/video");
      return data;
    },
    refetchOnWindowFocus: false,
  });
};

export const useGetVideo = (id: string | null) => {
  return useQuery<VideoResponse, Error>({
    queryKey: ["video", id],
    queryFn: async (): Promise<VideoResponse> => {
      const { data } = await instance.get<VideoResponse>(`/video/${id}`);
      return data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
};
