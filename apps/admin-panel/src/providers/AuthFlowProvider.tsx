import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { useNavigate } from "react-router-dom";

type FlowKey = "login" | "forgot";
type LoginStage = "login" | "verify-otp";
type ForgotStage = "forgot-password" | "forgot-password-otp" | "new-password";
type StageValue = LoginStage | ForgotStage | string;

interface FlowState {
  stage: StageValue;
  email?: string;
}

interface AuthFlowContextValue {
  currentFlow: FlowKey;
  active: FlowState;
  getFlowState: (flow: FlowKey) => FlowState;
  setFlow: (flow: FlowKey) => void;
  setStage: (stage: StageValue) => void;
  setEmail: (email: string) => void;
  navigateToStage: (stage?: StageValue) => void;
}

const KEY_FLOW = "auth_flow";
const KEY_LOGIN_STAGE = "auth_stage_login";
const KEY_LOGIN_EMAIL = "auth_email_login";
const KEY_FORGOT_STAGE = "auth_stage_forgot";
const KEY_FORGOT_EMAIL = "auth_email_forgot";

const AuthFlowContext = createContext<AuthFlowContextValue | undefined>(
  undefined
);

export const AuthFlowProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const navigate = useNavigate();

  const initialFlow: FlowKey =
    (typeof window !== "undefined" &&
      (sessionStorage.getItem(KEY_FLOW) as FlowKey)) ||
    "login";
  const [currentFlow, setCurrentFlow] = useState<FlowKey>(initialFlow);

  const initialLoginStage =
    (typeof window !== "undefined" &&
      (sessionStorage.getItem(KEY_LOGIN_STAGE) as StageValue)) ||
    "login";
  const initialLoginEmail =
    (typeof window !== "undefined" &&
      (sessionStorage.getItem(KEY_LOGIN_EMAIL) ?? "")) ||
    "";

  const initialForgotStage =
    (typeof window !== "undefined" &&
      (sessionStorage.getItem(KEY_FORGOT_STAGE) as StageValue)) ||
    "forgot-password";
  const initialForgotEmail =
    (typeof window !== "undefined" &&
      (sessionStorage.getItem(KEY_FORGOT_EMAIL) ?? "")) ||
    "";

  const [loginState, setLoginState] = useState<FlowState>({
    stage: initialLoginStage,
    email: initialLoginEmail
  });
  const [forgotState, setForgotState] = useState<FlowState>({
    stage: initialForgotStage,
    email: initialForgotEmail
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY_FLOW, currentFlow);
      sessionStorage.setItem(KEY_LOGIN_STAGE, String(loginState.stage));
      sessionStorage.setItem(KEY_LOGIN_EMAIL, loginState.email ?? "");
      sessionStorage.setItem(KEY_FORGOT_STAGE, String(forgotState.stage));
      sessionStorage.setItem(KEY_FORGOT_EMAIL, forgotState.email ?? "");
    } catch {
      // noop if storage not available
    }
  }, [currentFlow, loginState, forgotState]);

  const getFlowState = (flow: FlowKey) =>
    flow === "login" ? loginState : forgotState;

  const setFlow = (flow: FlowKey) => setCurrentFlow(flow);

  const setStage = (stage: StageValue) => {
    if (currentFlow === "login") setLoginState((s) => ({ ...s, stage }));
    else setForgotState((s) => ({ ...s, stage }));
  };

  const setEmail = (email: string) => {
    if (currentFlow === "login") setLoginState((s) => ({ ...s, email }));
    else setForgotState((s) => ({ ...s, email }));
  };

  const navigateToStage = (stage?: StageValue) => {
    const target = stage ?? getFlowState(currentFlow).stage;
    navigate(`/${String(target)}`);
  };

  const value = useMemo<AuthFlowContextValue>(
    () => ({
      currentFlow,
      active: getFlowState(currentFlow),
      getFlowState,
      setFlow,
      setStage,
      setEmail,
      navigateToStage
    }),
    [currentFlow, loginState, forgotState]
  );

  return (
    <AuthFlowContext.Provider value={value}>
      {children}
    </AuthFlowContext.Provider>
  );
};

export const useAuthFlow = (): AuthFlowContextValue => {
  const ctx = useContext(AuthFlowContext);
  if (!ctx) throw new Error("useAuthFlow must be used inside AuthFlowProvider");
  return ctx;
};
