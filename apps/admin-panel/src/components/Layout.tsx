import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useAuthStore } from "@/store";
import axios from "@/api/axios";
import { Spin } from "antd";
import { Shell } from "./Shell";
import { Sidebar } from "./Sidebar";
import { MobileNavigation } from "./MobileNavigation";

interface LayoutProps {
  children: React.ReactNode;
  route?: any;
  path?: string;
}

export const LoadingScreen: React.FC = () => {
  return (
    <div className="absolute inset-0 flex min-h-screen w-full items-center justify-center">
      <Spin className="left-0" size="large" />
    </div>
  );
};

const CustomLayout: React.FC<LayoutProps> = ({ children, route }) => {
  const { isLoggedIn, login, logout } = useAuthStore();

  const { refetch } = useQuery("renew", {
    queryFn: async () => {
      if (!isLoggedIn) {
        return;
      }
      const { data } = await axios.get(`/auth/renew`);
      return data;
    },
    onSuccess: (data) => {
      if (data?.data?.user) {
        login({
          data: {
            user: data.data.user
          }
        });
      } else {
        logout();
      }
    },
    onError() {
      logout();
    }
  });

  const [checking, setChecking] = useState(true);
  const [searchParams] = useSearchParams();
  const searchData = searchParams.get("data");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    setChecking(true);
    void refetch()
      .catch((error) => {
        console.error("Error renewing session:", error);
      })
      .finally(() => {
        if (mounted) setChecking(false);
      });
    return () => {
      mounted = false;
    };
    //
  }, [location.pathname]);

  useEffect(() => {
    if (searchData) {
      navigate("/", { replace: true });
    }
  }, [searchData, navigate]);

  useEffect(() => {
    if (checking) return;
    if (!route) return;

    const isAuthRoute = Boolean(route.isAuthRoute);
    const isWildcard = route.path === "*";

    if (isWildcard) return;

    if (isAuthRoute && isLoggedIn) {
      if (location.pathname !== "/dashboard") {
        navigate("/dashboard", { replace: true });
      }
      return;
    }

    if (!isAuthRoute && !isLoggedIn) {
      if (location.pathname !== "/login") {
        navigate("/login", { replace: true });
      }
      return;
    }
  }, [route, isLoggedIn, checking, location.pathname, navigate]);

  return (
    <div className="flex min-h-screen w-full">
      <main className="!text-foreground flex flex-1">
        {isLoggedIn ? (
          <>
            <Sidebar />
            <MobileNavigation />
            <Shell>{checking ? <LoadingScreen /> : children}</Shell>
          </>
        ) : checking ? (
          <LoadingScreen />
        ) : (
          children
        )}
      </main>
    </div>
  );
};

export default CustomLayout;
