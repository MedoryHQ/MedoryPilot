import { VideoResponse, VideosResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";

export const useGetVideos = (search?: URLSearchParams) => {
  return useQuery<VideosResponse, Error>({
    queryKey: ["videos", search?.toString() ?? ""],
    queryFn: async (): Promise<VideosResponse> => {
      const { data } = await instance.get<VideosResponse>(
        `/video${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
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
    refetchInterval: false
  });
};
