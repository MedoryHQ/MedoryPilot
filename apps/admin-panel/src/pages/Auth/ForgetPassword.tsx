import { useAuthFlow } from "@/providers/AuthFlowProvider";
import { useAuthStore } from "@/store";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {
  const { active } = useAuthFlow();
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate("/");
  }, [isLoggedIn]);

  switch (active?.stage) {
    default:
      return <>forget</>;
  }
};

export const forgetPasswordNavigationRoute = {
  element: <ForgetPassword />,
  path: "/forget-password",
  isAuthRoute: true
};

export default ForgetPassword;
