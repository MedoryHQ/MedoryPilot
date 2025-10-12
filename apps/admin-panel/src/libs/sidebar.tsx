import { NavItem, SidebarItem } from "@/types";
import { toUpperCase } from "@/utils";
import {
  Home,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  BarChart3,
  Globe,
  User,
  HelpCircle,
  Menu,
  Phone,
  Share2,
  Layout,
  Copy,
  Package,
  FolderTree
} from "lucide-react";
import { useTranslation } from "react-i18next";

export const useMenuItems = (): SidebarItem[] => {
  const { t } = useTranslation();

  return [
    {
      key: "dashboard",
      href: "dashboard",
      icon: <Home className="h-5 w-5" />,
      label: toUpperCase(t("menu.dashboard"))
    },
    {
      key: "patients",
      href: "patients",
      icon: <Users className="h-5 w-5" />,
      label: toUpperCase(t("menu.patients"))
    },
    {
      key: "appointments",
      href: "appointments",
      icon: <Calendar className="h-5 w-5" />,
      label: toUpperCase(t("menu.appointments"))
    },
    {
      key: "examinations",
      icon: <FileText className="h-5 w-5" />,
      label: toUpperCase(t("menu.examinations")),
      children: [
        {
          key: "examinations-visits",
          href: "examinations/visits",
          icon: <Users className="h-4 w-4" />,
          label: toUpperCase(t("menu.visits"))
        },
        {
          key: "examinations-all",
          href: "examinations/all",
          icon: <FileText className="h-4 w-4" />,
          label: toUpperCase(t("menu.examinations"))
        },
        {
          key: "examinations-documents",
          href: "examinations/documents",
          icon: <FileText className="h-4 w-4" />,
          label: toUpperCase(t("menu.documents"))
        }
      ]
    },
    {
      key: "messages",
      href: "messages",
      icon: <MessageSquare className="h-5 w-5" />,
      label: toUpperCase(t("menu.messages"))
    },
    {
      key: "landing",
      icon: <Globe className="h-5 w-5" />,
      label: toUpperCase(t("menu.website")),
      children: [
        {
          key: "landing-overview",
          href: "landing/overview",
          icon: <Home className="h-4 w-4" />,
          label: toUpperCase(t("menu.overview"))
        },
        {
          key: "headers",
          href: "landing/headers",
          label: toUpperCase(t("overview.headers")),
          icon: <Layout className="h-4 w-4" />
        },
        {
          key: "categories",
          label: toUpperCase(t("overview.categories")),
          href: "landing/categories",
          icon: <FolderTree className="h-4 w-4" />
        },
        {
          key: "introduce",
          label: toUpperCase(t("overview.introduce")),
          href: "landing/introduce",
          icon: <User className="h-4 w-4" />
        },
        {
          key: "landing-news",
          href: "landing/newses",
          icon: <FileText className="h-4 w-4" />,
          label: toUpperCase(t("menu.news"))
        },
        {
          key: "landing-services",
          href: "landing/services",
          icon: <Settings className="h-4 w-4" />,
          label: toUpperCase(t("menu.services"))
        },
        {
          key: "faqs",
          label: toUpperCase(t("overview.faqs")),
          href: "landing/faqs",
          icon: <HelpCircle className="h-4 w-4" />
        },
        {
          key: "landing-blogs",
          href: "landing/blogs",
          icon: <FileText className="h-4 w-4" />,
          label: toUpperCase(t("menu.blogs"))
        },

        {
          key: "contact",
          label: toUpperCase(t("overview.contact")),
          href: "landing/contact",
          icon: <Phone className="h-4 w-4" />
        },
        {
          key: "footers",
          label: toUpperCase(t("overview.footer")),
          href: "landing/footers",
          icon: <Copy className="h-4 w-4" />
        },
        {
          key: "socials",
          label: toUpperCase(t("overview.socials")),
          href: "landing/socials",
          icon: <Share2 className="h-4 w-4" />
        },
        {
          key: "pages",
          label: toUpperCase(t("overview.pages")),
          href: "landing/page-components",
          icon: <Globe className="h-4 w-4" />
        },
        {
          key: "tariffs",
          label: toUpperCase(t("overview.tariffs")),
          href: "landing/tariffs",
          icon: <Package className="h-4 w-4" />
        }
      ]
    },
    {
      key: "analytics",
      href: "analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      label: toUpperCase(t("menu.analytics"))
    },
    {
      key: "settings",
      icon: <Settings className="h-5 w-5" />,
      label: toUpperCase(t("menu.settings")),
      children: [
        {
          key: "settings-general",
          href: "settings/general",
          icon: <Settings className="h-4 w-4" />,
          label: toUpperCase(t("menu.general"))
        },
        {
          key: "settings-profile",
          href: "settings/profile",
          icon: <User className="h-4 w-4" />,
          label: toUpperCase(t("menu.profile"))
        },
        {
          href: "settings/security",
          key: "settings-security",
          icon: <Settings className="h-4 w-4" />,
          label: toUpperCase(t("menu.security"))
        },
        {
          href: "settings/help-and-support",
          key: "help-and-support",
          icon: <HelpCircle className="h-4 w-4" />,
          label: toUpperCase(t("menu.helpAndSupport"))
        }
      ]
    }
  ];
};

export const usePrimaryNavItems = (): NavItem[] => {
  const { t } = useTranslation();
  return [
    {
      key: "dashboard",
      href: "dashboard",
      icon: <Home />,
      label: toUpperCase(t("menu.dashboard"))
    },
    {
      key: "patients",
      href: "patients",
      icon: <Users />,
      label: toUpperCase(t("menu.patients"))
    },
    {
      key: "menu",
      icon: <Menu />,
      label: toUpperCase(t("menu.menu")),
      action: "openMenu"
    }
  ];
};
