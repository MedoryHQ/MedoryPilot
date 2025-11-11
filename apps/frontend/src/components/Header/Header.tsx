"use client";
import { motion } from "framer-motion";
import { LocaleSwitcher, Shell } from "..";
import { Navigations, MobileMenu, Search } from ".";
import { useLocale, useTranslations } from "next-intl";
import { toUpperCase } from "@/utils";
import { fadeVariant } from "../ui";
import { Link } from "@/i18n/routing";
import { ArrowRight, Menu } from "lucide-react";
import { cn } from "@heroui/react";
import { useState } from "react";

export const Header = () => {
  const locale = useLocale();
  const t = useTranslations("Header");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.header
      variants={fadeVariant}
      initial="hidden"
      animate="visible"
      custom={0}
      className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 "
    >
      <Shell className="items-center" variant="wrapper">
        <Link className="p-0! h-min" href="/">
          <span
            className={cn(
              " font-bold text-primary pl-2 md:pl-3",
              locale === "en"
                ? "text-[22px] lg:text-[26px] xl:text-[28px]"
                : "text-[20px] md:text-[18px] lg:text-[22px] xl:text-[26px]"
            )}
          >
            {toUpperCase(t("name"))}
          </span>
        </Link>
        <Navigations />
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
        <div className="flex gap-1 md:hidden items-center">
          <LocaleSwitcher />
          <button
            className="p-2 hover:bg-primary/10 rounded-md transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-5 h-5 text-primary" />
          </button>
        </div>
      </Shell>
      <MobileMenu
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
    </motion.header>
  );
};
