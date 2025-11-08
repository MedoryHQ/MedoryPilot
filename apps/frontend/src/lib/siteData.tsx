import { routing } from "@/i18n/routing";

export interface NavLinkType {
  href: keyof typeof routing.pathnames;
  isLocale?: boolean;
  label: {
    en: string;
    ka: string;
  };
}

export const nav_links: NavLinkType[] = [
  {
    href: routing.pathnames["/"],
    isLocale: true,
    label: {
      en: "Home",
      ka: "მთავარი",
    },
  },
  {
    href: routing.pathnames["/about-me"],
    label: {
      en: "About me",
      ka: "ჩემს შესახებ",
    },
  },
  {
    href: routing.pathnames["/blogs"],
    label: {
      en: "Blogs",
      ka: "ბლოგები",
    },
  },
  {
    href: routing.pathnames["/newses"],
    label: {
      en: "Newses",
      ka: "სიახლეები",
    },
  },
  {
    href: routing.pathnames["/contact"],
    label: {
      en: "Contact",
      ka: "კონტაქტი",
    },
  },
];
