import { LoginForm } from "@/components/auth";
import { useAuthStore } from "@/store";
import { LoginStage } from "@/types";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({
  setLoginState
}: {
  setLoginState?: React.Dispatch<React.SetStateAction<LoginStage>>;
}) => {
  const { isLoggedIn, setOtpSent, clearOtp, login } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate("/");
  }, [isLoggedIn]);

  const handleLoginSuccess = (
    submittedEmail: string,
    requiresOtp: boolean,
    payload?: any
  ) => {
    if (requiresOtp && setLoginState) {
      setLoginState({ stage: "verify-otp", email: submittedEmail });
      navigate("/verify-otp");
      setOtpSent(submittedEmail);
    } else {
      login({ data: { user: payload.data.user } });
      clearOtp();
      navigate("/");
    }
  };

  return <LoginForm onSuccess={handleLoginSuccess} />;
};

export const loginNavigationRoute = {
  element: <Login />,
  path: "/login",
  isAuthRoute: true
};

export default Login;
