import { LoginStage } from "@/types";
import {
  Users,
  Calendar,
  BarChart3,
  MessageCircle,
  FileText,
  Globe
} from "lucide-react";

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
        title: "global.loginTitle",
        subtitle: "global.loginSubtitle"
      };
    case "verify-otp":
      return {
        title: "global.otpTitle",
        subtitle: "global.otpSubtitle"
      };
    case "forgot-password":
      return {
        title: "global.passwordTitle",
        subtitle: "global.passwordSubtitle"
      };
    case "forgot-password-otp":
      return {
        title: "global.resetTitle",
        subtitle: "global.resetSubtitle"
      };
    case "new-password":
      return {
        title: "global.newPasswordTitle",
        subtitle: "global.newPasswordSubtitle"
      };
    default:
      return {
        title: "global.loginTitle",
        subtitle: "global.loginSubtitle"
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
  },
  {
    icon: MessageCircle,
    title: "global.communicationTitle",
    desc: "global.communicationDescription"
  },
  {
    icon: FileText,
    title: "global.filesTitle",
    desc: "global.filesDescription"
  },
  {
    icon: Globe,
    title: "global.websiteTitle",
    desc: "global.websiteDescription"
  }
];
