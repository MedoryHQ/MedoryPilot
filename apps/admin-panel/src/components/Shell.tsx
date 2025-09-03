import React, { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar/Sidebar";
import { Header } from "./Header";

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
          <Header />
          <main className="p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
};
