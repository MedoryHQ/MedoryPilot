import { LocaleConfig } from "@/components/ui";
import { Stage } from "@/types";
import { toUpperCase } from "@/utils";
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
  Package,
  Video,
  Briefcase,
  GraduationCap
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
    label: toUpperCase(t("overview.headers")),
    description: toUpperCase(t("overview.headersDescription")),
    icon: Layout,
    color: "bg-blue-500"
  },
  {
    key: "introduce",
    label: toUpperCase(t("overview.introduce")),
    description: toUpperCase(t("overview.introduceDescription")),
    icon: User,
    color: "bg-teal-500"
  },
  {
    key: "newses",
    label: toUpperCase(t("overview.news")),
    description: toUpperCase(t("overview.newsDescription")),
    icon: Newspaper,
    color: "bg-orange-500"
  },
  {
    key: "services",
    label: toUpperCase(t("overview.services")),
    description: toUpperCase(t("overview.servicesDescription")),
    icon: Settings,
    color: "bg-green-500"
  },
  {
    key: "faqs",
    label: toUpperCase(t("overview.faqs")),
    description: toUpperCase(t("overview.faqsDescription")),
    icon: HelpCircle,
    color: "bg-indigo-500"
  },
  {
    key: "blogs",
    label: toUpperCase(t("overview.blogs")),
    description: toUpperCase(t("overview.blogsDescription")),
    icon: FileText,
    color: "bg-purple-500"
  },
  {
    key: "categories",
    label: toUpperCase(t("overview.categories")),
    description: toUpperCase(t("overview.categoriesDescription")),
    icon: Layers,
    color: "bg-amber-500"
  },
  {
    key: "contacts",
    label: toUpperCase(t("overview.contacts")),
    description: toUpperCase(t("overview.contactsDescription")),
    icon: Phone,
    color: "bg-teal-500"
  },
  {
    key: "footer",
    label: toUpperCase(t("overview.footer")),
    description: toUpperCase(t("overview.footerDescription")),
    icon: Copy,
    color: "bg-slate-500"
  },
  {
    key: "socials",
    label: toUpperCase(t("overview.socials")),
    description: toUpperCase(t("overview.socialsDescription")),
    icon: Share2,
    color: "bg-pink-500"
  },
  {
    key: "pages",
    label: toUpperCase(t("overview.pages")),
    description: toUpperCase(t("overview.pagesDescription")),
    icon: Globe,
    color: "bg-cyan-500"
  },
  {
    key: "tariffs",
    label: toUpperCase(t("overview.tariffs")),
    description: toUpperCase(t("overview.tariffsDescription")),
    icon: Package,
    color: "bg-rose-500"
  },
  {
    key: "about",
    label: toUpperCase(t("overview.about")),
    description: toUpperCase(t("overview.aboutDescription")),
    icon: User,
    color: "bg-red-400"
  },
  {
    key: "educations",
    label: toUpperCase(t("overview.educations")),
    description: toUpperCase(t("overview.educationsDescription")),
    icon: GraduationCap,
    color: "bg-blue-400"
  },
  {
    key: "experiences",
    label: toUpperCase(t("overview.experiences")),
    description: toUpperCase(t("overview.experiencesDescription")),
    icon: Briefcase,
    color: "bg-green-400"
  },
  {
    key: "videos",
    label: toUpperCase(t("overview.videos")),
    description: toUpperCase(t("overview.videosDescription")),
    icon: Video,
    color: "bg-purple-400"
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
  { key: "footer", label: "overview.footer", icon: Copy },
  { key: "socials", label: "overview.socials", icon: Share2 },
  { key: "pages", label: "overview.pages", icon: Globe },
  { key: "tariffs", label: "overview.tariffs", icon: Package },
  { key: "about", label: "overview.about", icon: User },
  { key: "educations", label: "overview.educations", icon: GraduationCap },
  { key: "experiences", label: "overview.experiences", icon: Briefcase },
  { key: "videos", label: "overview.videos", icon: Video }
];

export const locales = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ka", label: "ქართული", flag: "🇬🇪" }
] as LocaleConfig[];
