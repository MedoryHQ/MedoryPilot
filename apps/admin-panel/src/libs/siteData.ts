import { LoginStage } from "@/types";
import { Users, Calendar, BarChart3 } from "lucide-react";

type SubNavigationItem = {
  name: string;
  href: string;
  requiresId?: boolean;
};

export const subNavigations: Record<string, SubNavigationItem[]> = {};

export const booleanArray = [
  {
    name: "yes"
  },
  {
    name: "no"
  }
];

export const georgianMonths = [
  "იანვარი",
  "თებერვალი",
  "მარტი",
  "აპრილი",
  "მაისი",
  "ივნისი",
  "ივლისი",
  "აგვისტო",
  "სექტემბერი",
  "ოქტომბერი",
  "ნოემბერი",
  "დეკემბერი"
];

export const getPageInfo = (loginState: LoginStage) => {
  switch (loginState.stage) {
    case "login":
      return {
        title: "Welcome back",
        subtitle: "Sign in to your account to continue"
      };
    case "otp":
      return {
        title: "Verify your email",
        subtitle: "Enter the verification code sent to your email"
      };
    case "forgot-password":
      return {
        title: "Reset password",
        subtitle: "Enter your email address to receive a reset code"
      };
    case "reset-otp":
      return {
        title: "Enter reset code",
        subtitle: "Enter the reset code from your email"
      };
    case "new-password":
      return {
        title: "Create new password",
        subtitle: "Choose a strong password for your account"
      };
    default:
      return {
        title: "Welcome back",
        subtitle: "Sign in to your account to continue"
      };
  }
};

export const platformServices = [
  {
    icon: Users,
    title: "global.patientTitle",
    desc: "global.patientDescription"
  },
  {
    icon: Calendar,
    title: "global.schedulingTitle",
    desc: "global.schedulingDescription"
  },
  {
    icon: BarChart3,
    title: "global.dasboardTitle",
    desc: "global.dashboardDescription"
  }
];
