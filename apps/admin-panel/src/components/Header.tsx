import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toUpperCase } from "@/utils";
import { ThemeSwitcher, LanguageChanger, Search } from "./ui";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSidebarStore } from "@/store";

export const Header: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.split("/");
  const { t } = useTranslation();
  const [searchFocused, setSearchFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { collapsed, toggleCollapsed } = useSidebarStore();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (mobile && !collapsed) {
        toggleCollapsed();
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    //
  }, [collapsed]);

  return (
    <>
      <AnimatePresence>
        {searchFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="bg-background/60 pointer-events-none fixed inset-0 z-20"
          />
        )}
      </AnimatePresence>

      <motion.div
        className="bg-background page-transition-container"
        animate={{
          marginLeft: isMobile ? 0 : collapsed ? 72 : 240
        }}
        transition={{
          duration: 0.3,
          ease: [0.16, 1, 0.3, 1]
        }}
      >
        <motion.header
          className="bg-card border-border sticky top-0 z-30 flex h-16 items-center border-b px-4 backdrop-blur-sm md:px-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex w-full items-center justify-between gap-4">
            <motion.div
              animate={{
                opacity: isMobile ? (searchFocused ? 0 : 1) : 1,
                x: isMobile ? (searchFocused ? -20 : 0) : 0
              }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <div>
                <h1 className="text-foreground font-semibold">
                  {toUpperCase(
                    t(`menu.${currentPath[currentPath.length - 1]}`)
                  )}
                </h1>
                <div className="text-muted-foreground text-xs">
                  {toUpperCase(t("global.adminPannel"))}
                </div>
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              <Search
                setSearchFocused={setSearchFocused}
                isMobile={isMobile}
                searchFocused={searchFocused}
              />
              {!isMobile ? (
                <>
                  <LanguageChanger />
                  <ThemeSwitcher />
                </>
              ) : null}
            </div>
          </div>
        </motion.header>
      </motion.div>
    </>
  );
};
