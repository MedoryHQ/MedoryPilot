import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Sidebar } from "./Sidebar/Sidebar";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";
import { LanguageChanger } from "./ui";

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const searchRef = React.useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { t } = useTranslation();
  const currentPath = location.pathname.slice(1);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (mobile && !collapsed) {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [collapsed]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="site-frame">
      <Sidebar />

      <div
        className="transition-all duration-200 ease-out"
        style={{
          marginLeft: isMobile ? "72px" : collapsed ? "72px" : "240px",
          minHeight: "100vh"
        }}
      >
        <div className="content-main-card">
          <motion.header
            className="bg-card border-border sticky top-0 z-30 flex h-16 items-center border-b px-4 backdrop-blur-sm md:px-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-foreground font-semibold">
                    {toUpperCase(t(`pages.${currentPath}`))}
                  </h1>
                  <div className="text-muted-foreground text-xs">
                    {toUpperCase(t("global.adminPannel"))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div ref={searchRef} className="relative hidden sm:block">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Search className="text-muted-foreground h-4 w-4" />
                  </div>
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={toUpperCase(t("global.search"))}
                    className="bg-muted/50 border-border h-10 w-48 rounded-lg pr-4 pl-12 transition-all duration-300 lg:w-96"
                  />
                </div>
                <LanguageChanger />
              </div>
            </div>
          </motion.header>

          <main className="p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
};
