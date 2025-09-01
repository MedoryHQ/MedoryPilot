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
  User
} from "lucide-react";
import { useTranslation } from "react-i18next";

export const useMenuItems = (): SidebarItem[] => {
  const { t } = useTranslation();

  return [
    {
      key: "dashboard",
      icon: <Home className="h-5 w-5" />,
      label: t("menu.dashboard")
    },
    {
      key: "patients",
      icon: <Users className="h-5 w-5" />,
      label: t("menu.patients")
    },
    {
      key: "appointments",
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
          icon: <Users className="h-4 w-4" />,
          label: t("menu.visits")
        },
        {
          key: "examinations-list",
          icon: <FileText className="h-4 w-4" />,
          label: t("menu.examinations")
        },
        {
          key: "examinations-documents",
          icon: <FileText className="h-4 w-4" />,
          label: t("menu.documents")
        }
      ]
    },
    {
      key: "messages",
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
          icon: <Home className="h-4 w-4" />,
          label: t("menu.home")
        },
        // {
        //   key: "landing-services",
        //   icon: <Settings className="h-4 w-4" />,
        //   label: t("menu.services")
        // },
        {
          key: "landing-news",
          icon: <FileText className="h-4 w-4" />,
          label: t("menu.news")
        },
        {
          key: "landing-blogs",
          icon: <FileText className="h-4 w-4" />,
          label: t("menu.blogs")
        }
      ]
    },
    {
      key: "analytics",
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
          icon: <Settings className="h-4 w-4" />,
          label: t("menu.general")
        },
        {
          key: "settings-profile",
          icon: <User className="h-4 w-4" />,
          label: t("menu.profile")
        },
        {
          key: "settings-security",
          icon: <Settings className="h-4 w-4" />,
          label: t("menu.security")
        }
      ]
    }
  ];
};
