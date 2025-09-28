import { Stage } from "@/types";
import {
  Users,
  Calendar,
  BarChart3,
  MessageCircle,
  FileText,
  Globe,
  HelpCircle,
  Newspaper,
  Settings,
  Phone,
  Share2,
  Layout,
  User,
  Layers,
  Copy,
  Package
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

export const getPageInfo = (stage: Stage) => {
  switch (stage) {
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

export const overviewStatsConfig = [
  { key: "headers", label: "overview.headers", icon: Layout },
  { key: "introduce", label: "overview.introduce", icon: User },
  { key: "newses", label: "overview.news", icon: Newspaper },
  { key: "services", label: "overview.services", icon: Settings },
  { key: "faqs", label: "overview.faqs", icon: HelpCircle },
  { key: "blogs", label: "overview.blogs", icon: FileText },
  { key: "categories", label: "overview.categories", icon: Layers },
  { key: "contacts", label: "overview.contacts", icon: Phone },
  { key: "footers", label: "overview.footers", icon: Copy },
  { key: "socials", label: "overview.socials", icon: Share2 },
  { key: "pages", label: "overview.pages", icon: Globe },
  { key: "tariffs", label: "overview.tariffs", icon: Package }
];
