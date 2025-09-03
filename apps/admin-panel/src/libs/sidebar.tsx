import { SidebarItem } from "@/types";
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
  HelpCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";

export const useMenuItems = (): SidebarItem[] => {
  const { t } = useTranslation();

  return [
    {
      key: "dashboard",
      href: "dashboard",
      icon: <Home className="h-5 w-5" />,
      label: t("menu.dashboard")
    },
    {
      key: "patients",
      href: "patients",
      icon: <Users className="h-5 w-5" />,
      label: t("menu.patients")
    },
    {
      key: "appointments",
      href: "appointments",
      icon: <Calendar className="h-5 w-5" />,
      label: t("menu.appointments")
    },
    {
      key: "examinations",
      icon: <FileText className="h-5 w-5" />,
      label: t("menu.examinations"),
      children: [
        {
          key: "examinations-visits",
          href: "examinations/visits",
          icon: <Users className="h-4 w-4" />,
          label: t("menu.visits")
        },
        {
          key: "examinations-list",
          href: "examinations",
          icon: <FileText className="h-4 w-4" />,
          label: t("menu.examinations")
        },
        {
          key: "examinations-documents",
          href: "examinations/documents",
          icon: <FileText className="h-4 w-4" />,
          label: t("menu.documents")
        }
      ]
    },
    {
      key: "messages",
      href: "messages",
      icon: <MessageSquare className="h-5 w-5" />,
      label: t("menu.messages")
    },
    {
      key: "landing",
      icon: <Globe className="h-5 w-5" />,
      label: t("menu.website"),
      children: [
        {
          key: "landing-home",
          href: "landing",
          icon: <Home className="h-4 w-4" />,
          label: t("menu.home")
        },
        // {
        //   key: "landing-services",
        //   href: "landing/services",
        //   icon: <Settings className="h-4 w-4" />,
        //   label: t("menu.services")
        // },
        {
          key: "landing-news",
          href: "landing/news",
          icon: <FileText className="h-4 w-4" />,
          label: t("menu.news")
        },
        {
          key: "landing-blogs",
          href: "landing/blogs",
          icon: <FileText className="h-4 w-4" />,
          label: t("menu.blogs")
        }
      ]
    },
    {
      key: "analytics",
      href: "analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      label: t("menu.analytics")
    },
    {
      key: "settings",
      icon: <Settings className="h-5 w-5" />,
      label: t("menu.settings"),
      children: [
        {
          key: "settings-general",
          href: "settings",
          icon: <Settings className="h-4 w-4" />,
          label: t("menu.general")
        },
        {
          key: "settings-profile",
          href: "settings/profile",
          icon: <User className="h-4 w-4" />,
          label: t("menu.profile")
        },
        {
          href: "settings/security",
          key: "settings-security",
          icon: <Settings className="h-4 w-4" />,
          label: t("menu.security")
        },
        {
          href: "settings/help-and-support",
          key: "help-and-support",
          icon: <HelpCircle className="h-4 w-4" />,
          label: t("menu.helpAndSupport")
        }
      ]
    }
  ];
};
