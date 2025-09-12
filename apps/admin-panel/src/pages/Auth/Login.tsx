import { useEffect } from "react";
import { LoginForm, OtpVerificationForm } from "@/components/auth";
import { useAuthStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { useAuthFlow } from "@/providers/AuthFlowProvider";

const Login: React.FC = () => {
  const { active } = useAuthFlow();
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate("/");
  }, [isLoggedIn, navigate]);

  switch (String(active.stage)) {
    case "verify-otp":
      return <OtpVerificationForm />;
    case "login":
    default:
      return <LoginForm />;
  }
};

export const loginNavigationRoute = {
  element: <Login />,
  path: "/login",
  isAuthRoute: true
};

export default Login;
