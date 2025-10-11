import { CategoryResponse, CategoriesResponse } from "@/types/website";
import instance from "../../api/axios";
import { useQuery } from "react-query";

export const useGetCategories = (search?: URLSearchParams) => {
  return useQuery<CategoriesResponse, Error>({
    queryKey: ["categories", search?.toString() ?? ""],
    queryFn: async (): Promise<CategoriesResponse> => {
      const { data } = await instance.get<CategoriesResponse>(
        `/category${search ? `?${search}` : ""}`
      );
      return data;
    },
    refetchOnWindowFocus: false
  });
};

export const useGetCategory = (id: string | null) => {
  return useQuery<CategoryResponse, Error>({
    queryKey: ["category", id],
    queryFn: async (): Promise<CategoryResponse> => {
      const { data } = await instance.get<CategoryResponse>(`/category/${id}`);
      return data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false
  });
};
