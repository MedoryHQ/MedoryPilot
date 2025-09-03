import React, { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar/Sidebar";
import { Header } from "./Header";
import { cn } from "@/libs";
import { useSidebarStore } from "@/store";

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed]);

  return (
    <div className="bg-background min-h-screen">
      <Sidebar />

      <div
        className={cn(
          "bg-background min-h-screen transition-all duration-200 ease-out",
          isMobile || collapsed ? "!ml-[72px]" : "ml-[240px]"
        )}
      >
        <Header />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
