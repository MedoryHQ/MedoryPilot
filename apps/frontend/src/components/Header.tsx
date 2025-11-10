"use client";
import { motion } from "framer-motion";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toUpperCase } from "@/utils";
import { fadeVariant } from "./ui";
import { Shell } from "./Shell";
import { Link, routing } from "@/i18n/routing";
import { nav_links } from "@/lib/siteData";
import { ArrowRight } from "lucide-react";
import { cn } from "@heroui/react";
import { Search } from "./Search";

export const Header = () => {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Header");

  return (
    <motion.header
      variants={fadeVariant}
      initial="hidden"
      animate="visible"
      custom={0}
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 "
    >
      <Shell className="items-center" variant="wrapper">
        <Link className="p-0! h-min" href="/">
          <span
            className={cn(
              " font-bold text-primary pl-2 md:pl-3",
              locale === "en"
                ? "md:text-[22px] lg:text-[26px] xl:text-[28px]"
                : "text-[18px] lg:text-[22px] xl:text-[26px]"
            )}
          >
            {toUpperCase(t("name"))}
          </span>
        </Link>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden md:flex items-center gap-4 lg:gap-8 xl:gap-10"
        >
          {nav_links
            .filter((link) => link.href !== "/")
            .map((item, index) => {
              const resolvedHref = routing.pathnames[item.href];
              return (
                <Link
                  key={index}
                  href={resolvedHref}
                  className={cn(
                    "text-sm font-medium **: transition-all duration-300 relative",
                    pathname.includes(resolvedHref)
                      ? 'text-foreground before:content-["•"] before:absolute before:-left-2 lg:before:-left-3 before:text-primary'
                      : "text-primary/75 hover:text-primary",

                    locale === "en"
                      ? "text-[14px] xl:text-[16px]"
                      : "text-[11px] lg:text-[12px] xl:text-[14px]"
                  )}
                >
                  {toUpperCase(item.label[locale as "en" | "ka"])}
                </Link>
              );
            })}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="md:flex items-center gap-2 lg:gap-3 xl:gap-4 hidden"
        >
          <Search />
          <LocaleSwitcher />
          <Link
            href="/sign-in"
            className="hidden lg:flex items-center gap-2 bg-primary text-[16px] text-white py-2 px-4 xl:px-5 rounded-full font-medium hover:bg-primary/90 transition-all hover:scale-102 shadow-lg"
          >
            {toUpperCase(t("getStarted"))}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </Shell>
    </motion.header>
  );
};
