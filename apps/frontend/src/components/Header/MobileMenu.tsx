import React, { Dispatch, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { toUpperCase } from "@/utils";
import { useTranslations } from "next-intl";
import { SearchFull } from "./Search";
import { ArrowRight, X } from "lucide-react";
import { MenuNavigations } from "./Navigations";

const MobileMenu = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const t = useTranslations("Header");

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-white z-40 lg:hidden"
        >
          <button
            className="absolute top-2 right-4 p-2 hover:bg-primary/10 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5 text-primary" />
          </button>
          <div className="h-full flex flex-col justify-center px-4">
            <MenuNavigations onClick={() => setIsMobileMenuOpen(false)} />
            <SearchFull onSubmit={() => setIsMobileMenuOpen(false)} />
            <Link
              href="/sign-in"
              className="flex items-center gap-2 justify-between bg-primary text-[18px] text-white py-3 px-5 rounded-[20px] font-medium hover:bg-primary/90 transition-all shadow-lg mt-6"
            >
              {toUpperCase(t("getStarted"))}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { MobileMenu };
