"use client";

import React from "react";
import { motion } from "framer-motion";
import { nav_links } from "@/lib/siteData";
import { Link, routing } from "@/i18n/routing";
import { cn, toUpperCase } from "@/utils";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

const Navigations = () => {
  const pathname = usePathname();
  const locale = useLocale();

  return (
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
  );
};

const MenuNavigations = ({ onClick }: { onClick?: () => void }) => {
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <nav className="flex flex-col gap-4 mb-8">
      {nav_links
        .filter((link) => link.href !== "/")
        .map((item, index) => {
          const resolvedHref = routing.pathnames[item.href];
          return (
            <Link
              key={index}
              href={resolvedHref}
              onClick={() => {
                onClick?.();
              }}
              className={`text-left text-xl font-medium py-3 px-4 rounded-xl transition-colors ${
                pathname.includes(resolvedHref)
                  ? "bg-primary/10 text-primary"
                  : "text-primary/70 hover:text-primary/80 hover:bg-primary/5"
              }`}
            >
              {toUpperCase(item.label[locale as "en" | "ka"])}
            </Link>
          );
        })}
    </nav>
  );
};

export { Navigations, MenuNavigations };
