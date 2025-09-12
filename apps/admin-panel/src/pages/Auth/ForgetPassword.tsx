import { useAuthStore } from "@/store";
import { LoginStage } from "@/types";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ForgetPassword = ({
  loginState,
  setLoginState
}: {
  loginState?: LoginStage;
  setLoginState?: React.Dispatch<React.SetStateAction<LoginStage>>;
}) => {
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate("/");
  }, [isLoggedIn]);

  switch (loginState?.stage) {
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
