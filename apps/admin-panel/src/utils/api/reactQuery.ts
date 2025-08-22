import { QueryClient } from "react-query";
import axios from "axios";

const defaultQueryFn = async ({
  queryKey
}: {
  queryKey: [string] | readonly unknown[];
}) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/v1/${queryKey[0]}`
  );
  return data;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      retry: false
    }
  }
});
