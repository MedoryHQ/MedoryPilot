import { type AppPathnames } from "@/i18n/routing";

export interface NavLinkType {
  href: AppPathnames;
  isLocale?: boolean;
  label: {
    en: string;
    ka: string;
  };
}

export const nav_links: NavLinkType[] = [
  {
    href: "/",
    isLocale: true,
    label: { en: "Home", ka: "მთავარი" },
  },
  {
    href: "/about-me",
    label: { en: "About me", ka: "ჩემს შესახებ" },
  },
  {
    href: "/blogs",
    label: { en: "Blogs", ka: "ბლოგები" },
  },
  {
    href: "/newses",
    label: { en: "Newses", ka: "სიახლეები" },
  },
  {
    href: "/contact",
    label: { en: "Contact", ka: "კონტაქტი" },
  },
];
