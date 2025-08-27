import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import * as Routes from "@/pages";
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
  const { isLoggedIn, currentUser, refreshToken, accessToken, login, logout } =
    useAuthStore();

  const { refetch } = useQuery("renew", {
    queryFn: async () => {
      if (!isLoggedIn) {
        return;
      }
      const { data } = await axios.get(`/auth/renew`);
      return data;
    },
    onSuccess(data) {
      if (!data?.data) {
        return logout();
      }

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
    }
  });

  const [searchParams] = useSearchParams();
  const data = searchParams.get("data");

  const navigate = useNavigate();
  const location = useLocation();

  if (data) {
    navigate(`/`);
  }

  useEffect(() => {
    const checkAuth = () => {
      if (path && route) {
        const pathSegment = path.split("/")[1] || "";
        const isCorrectPath = Object.keys(Routes).includes(pathSegment);
        const isAuthRoute = route.isAuthRoute;

        if (isAuthRoute && isLoggedIn) {
          navigate("/");
          return;
        }

        if (!currentUser && isCorrectPath) {
          navigate("/");
        }
      }
    };

    checkAuth();
  }, [path, route, isLoggedIn, currentUser, navigate]);

  useEffect(() => {
    refetch();
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen w-full">
      {" "}
      {/* parent stretches */}
      <main id="main" className="flex-1">
        {" "}
        {/* flex-1 fills remaining space */}
        {isLoggedIn
          ? children
          : route?.isAuthRoute
            ? children
            : Routes.authNavigationRoute.element}
      </main>
    </div>
  );
};

export default CustomLayout;
