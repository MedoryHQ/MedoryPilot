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

export const overviewQuickActions = (t: (key: string) => string) => [
  {
    key: "headers",
    label: t("overview.headers"),
    description: t("overview.headersDescription"),
    icon: Layout,
    color: "bg-blue-500"
  },
  {
    key: "introduce",
    label: t("overview.introduce"),
    description: t("overview.introduceDescription"),
    icon: User,
    color: "bg-teal-500"
  },
  {
    key: "newses",
    label: t("overview.news"),
    description: t("overview.newsDescription"),
    icon: Newspaper,
    color: "bg-orange-500"
  },
  {
    key: "services",
    label: t("overview.services"),
    description: t("overview.servicesDescription"),
    icon: Settings,
    color: "bg-green-500"
  },
  {
    key: "faqs",
    label: t("overview.faqs"),
    description: t("overview.faqsDescription"),
    icon: HelpCircle,
    color: "bg-indigo-500"
  },
  {
    key: "blogs",
    label: t("overview.blogs"),
    description: t("overview.blogsDescription"),
    icon: FileText,
    color: "bg-purple-500"
  },
  {
    key: "categories",
    label: t("overview.categories"),
    description: t("overview.categoriesDescription"),
    icon: Layers,
    color: "bg-amber-500"
  },
  {
    key: "contacts",
    label: t("overview.contacts"),
    description: t("overview.contactsDescription"),
    icon: Phone,
    color: "bg-teal-500"
  },
  {
    key: "footers",
    label: t("overview.footer"),
    description: t("overview.footerDescription"),
    icon: Copy,
    color: "bg-slate-500"
  },
  {
    key: "socials",
    label: t("overview.socials"),
    description: t("overview.socialsDescription"),
    icon: Share2,
    color: "bg-pink-500"
  },
  {
    key: "pages",
    label: t("overview.pages"),
    description: t("overview.pagesDescription"),
    icon: Globe,
    color: "bg-cyan-500"
  },
  {
    key: "tariffs",
    label: t("overview.tariffs"),
    description: t("overview.tariffsDescription"),
    icon: Package,
    color: "bg-rose-500"
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
  { key: "footers", label: "overview.footer", icon: Copy },
  { key: "socials", label: "overview.socials", icon: Share2 },
  { key: "pages", label: "overview.pages", icon: Globe },
  { key: "tariffs", label: "overview.tariffs", icon: Package }
];
