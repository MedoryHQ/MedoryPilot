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
import { Button } from "@heroui/react";
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
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
    >
      <Shell variant="wrapper">
        <motion.a
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center cursor-pointer"
          href="/"
        >
          <span className="text-2xl font-bold text-primary pl-3">
            {toUpperCase(t("name"))}
          </span>
        </motion.a>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden md:flex items-center gap-8"
        >
          {nav_links
            .filter((link) => link.href !== "/")
            .map((item, index) => {
              const resolvedHref = routing.pathnames[item.href];
              return (
                <Link
                  key={index}
                  href={resolvedHref}
                  className={`text-sm font-medium transition-colors relative ${
                    pathname.includes(resolvedHref)
                      ? 'text-foreground before:content-["•"] before:absolute before:-left-4 before:text-primary'
                      : "text-muted-foreground hover:text-foreground"
                  }`}
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
          className="md:flex items-center gap-4 hidden"
        >
          <Search />
          <LocaleSwitcher />
          <Button className="hidden lg:flex items-center gap-2 bg-primary text-[16px] text-white p-5 rounded-full font-medium hover:bg-primary/90 transition-all hover:scale-102 shadow-lg">
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </Shell>
    </motion.header>
  );
};
