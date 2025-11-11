import React from "react";
import { motion } from "framer-motion";
import { nav_links } from "@/lib/siteData";
import { routing } from "@/i18n/routing";
import Link from "next/link";
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

export { Navigations };
