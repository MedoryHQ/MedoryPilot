import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store";
import axios from "@/api/axios";
import { useQuery } from "react-query";

interface LayoutProps {
  children: React.ReactNode;
  route?: any;
  path?: string;
}

const CustomLayout: React.FC<LayoutProps> = ({ children, route, path }) => {
  const { isLoggedIn, login, logout, accessToken, refreshToken } =
    useAuthStore();

  const { refetch } = useQuery("renew", {
    queryFn: async () => {
      if (!isLoggedIn) return;
      const { data } = await axios.get(`/auth/renew`);
      return data;
    },
    onSuccess(data) {
      if (!data?.data) return logout();
      login({
        data: {
          user: data.data.admin,
          accessToken: accessToken!,
          refreshToken: refreshToken!
        }
      });
    },
    onError() {
      logout();
    },
    enabled: false
  });

  const [searchParams] = useSearchParams();
  const data = searchParams.get("data");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (data) {
      navigate("/", { replace: true });
    }
  }, [data, navigate]);

  useEffect(() => {
    if (!route) return;

    const isAuthRoute = Boolean(route.isAuthRoute);
    const isWildcard = route.path === "*";

    if (isWildcard) return;

    if (isAuthRoute && isLoggedIn) {
      navigate("/dashboard", { replace: true });
      return;
    }

    if (!isAuthRoute && !isLoggedIn) {
      navigate("/auth", { replace: true });
      return;
    }
  }, [route, isLoggedIn, navigate]);

  useEffect(() => {
    void refetch();
  }, [location.pathname, refetch]);

  return (
    <div className="flex min-h-screen w-full">
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default CustomLayout;
